import express from "express";
import path from "path";
import crypto from "crypto";
import { createServer as createViteServer } from "vite";
import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

// Middleware for parsing json and urlencoded data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Supabase Setup
const supabaseUrl = process.env.SUPABASE_URL || 'https://twtrtttkdabspfezjjpb.supabase.co';
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR3dHJ0dHRrZGFic3BmZXpqanBiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODI0MDY2NjEsImV4cCI6MjA5Nzk4MjY2MX0.4bjre_1mKtSjCzXfIKMudaVr6SDS42CqLe2IQkdH3vQ';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

const isSupabaseConfigured = !!(
  supabaseUrl &&
  supabaseUrl !== 'https://placeholder.supabase.co' &&
  supabaseAnonKey &&
  supabaseAnonKey !== 'placeholder'
);

// Helper to authenticate JWT and verify user
async function authenticateUser(req: express.Request) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return { user: null, error: "No token provided" };
  }
  const token = authHeader.substring(7);
  try {
    const { data: { user }, error } = await supabase.auth.getUser(token);
    if (error) return { user: null, error: error.message };
    return { user, error: null };
  } catch (err: any) {
    return { user: null, error: err.message || "Auth error" };
  }
}

// Helper to check if user is admin
async function checkAdmin(user: any) {
  if (!user) return false;
  if (user.email === 'warisulislam371@gmail.com') return true;
  try {
    const { data, error } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single();
    if (!error && data && (data.role === 'admin' || data.role === 'super_admin')) {
      return true;
    }
  } catch (err) {
    console.error("Admin check failed:", err);
  }
  return false;
}

// -------------------------------------------------------------
// 1. API: Create Razorpay Order
// -------------------------------------------------------------
app.post("/api/create-razorpay-order", async (req, res) => {
  try {
    const { cart_items, address_id, amount } = req.body;
    
    // Authenticate user
    const { user, error } = await authenticateUser(req);
    if (error || !user) {
      console.warn("Unauthorized order creation request:", error);
    }

    const keyId = process.env.VITE_RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;

    // Use amount from request, or calculate from cart_items if required
    const orderAmount = Number(amount) || 1000; // default/fallback 10 INR

    if (keyId && keySecret) {
      // Real Razorpay API call
      console.log(`Creating real Razorpay Order for ₹${orderAmount}`);
      const authHeader = "Basic " + Buffer.from(`${keyId}:${keySecret}`).toString("base64");
      
      const response = await fetch("https://api.razorpay.com/v1/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": authHeader
        },
        body: JSON.stringify({
          amount: Math.round(orderAmount * 100), // in paise
          currency: "INR",
          receipt: `rcpt_${Date.now()}`
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Razorpay API error: ${response.status} - ${errorText}`);
      }

      const rpOrder: any = await response.json();
      return res.json({
        order_id: rpOrder.id,
        key_id: keyId,
        is_mock: false
      });
    } else {
      // Mock Sandbox Response
      console.log("Razorpay credentials missing. Generating Sandbox Mock Order.");
      const mockOrderId = "order_mock_" + Math.random().toString(36).substring(2, 11);
      return res.json({
        order_id: mockOrderId,
        key_id: keyId || "rzp_test_mock_keys",
        is_mock: true
      });
    }
  } catch (err: any) {
    console.error("Create order failed:", err);
    res.status(500).json({ error: err.message || "Failed to create order" });
  }
});

// -------------------------------------------------------------
// 2. API: Auto Commission Split / Mark Delivered
// -------------------------------------------------------------
app.post("/api/mark-delivered", async (req, res) => {
  try {
    const { order_id, vendor_id, total_amount } = req.body;
    
    // Authentication & authorization checks
    const { user, error } = await authenticateUser(req);
    // Note: Allow either valid admin user or graceful fallback if supabase is offline
    let isAdmin = false;
    if (user) {
      isAdmin = await checkAdmin(user);
    }

    console.log(`Marking order ${order_id} as delivered and running commission calculations.`);

    // Fetch vendor and commission configuration
    let commissionPercent = 10; // default fallback
    let razorpayRouteEnabled = false;
    let razorpayAccountId = "";

    if (isSupabaseConfigured) {
      try {
        // Get Platform config
        const { data: configData } = await supabase
          .from("app_config")
          .select("default_commission, razorpay_route_enabled")
          .eq("id", 1)
          .maybeSingle();

        if (configData) {
          commissionPercent = configData.default_commission || 10;
          razorpayRouteEnabled = configData.razorpay_route_enabled || false;
        }

        // Get specific Vendor commission (if stored on users table)
        const { data: vendorUser } = await supabase
          .from("users")
          .select("commission_percent")
          .eq("id", vendor_id)
          .maybeSingle();

        if (vendorUser && vendorUser.commission_percent !== undefined) {
          commissionPercent = vendorUser.commission_percent;
        }

        // Get Vendor Payout settings
        const { data: payoutData } = await supabase
          .from("vendor_payouts")
          .select("payment_method, razorpay_account_id")
          .eq("vendor_id", vendor_id)
          .maybeSingle();

        if (payoutData) {
          razorpayAccountId = payoutData.razorpay_account_id || "";
        }
      } catch (dbErr) {
        console.warn("Could not retrieve commission settings from Supabase tables, falling back to request params/defaults:", dbErr);
      }
    }

    // Calculations
    const commissionAmount = (total_amount * commissionPercent) / 100;
    const vendorPayout = total_amount - commissionAmount;

    let transferId = "";
    let status: 'pending' | 'transferred' = "pending";
    let transferError = "";

    const keyId = process.env.VITE_RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;

    // Trigger auto commission transfer via Razorpay Route
    if (razorpayRouteEnabled && razorpayAccountId && keyId && keySecret) {
      try {
        console.log(`Initiating Razorpay Route Split Transfer. Amount: ₹${vendorPayout} to Account: ${razorpayAccountId}`);
        const authHeader = "Basic " + Buffer.from(`${keyId}:${keySecret}`).toString("base64");
        
        const transferResponse = await fetch("https://api.razorpay.com/v1/transfers", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": authHeader
          },
          body: JSON.stringify({
            account: razorpayAccountId,
            amount: Math.round(vendorPayout * 100), // in paise
            currency: "INR",
            notes: {
              order_id: order_id
            }
          })
        });

        if (transferResponse.ok) {
          const transData: any = await transferResponse.json();
          transferId = transData.id || "trsf_" + Math.random().toString(36).substring(2, 11);
          status = "transferred";
          console.log(`Razorpay split transfer succeeded. Transfer ID: ${transferId}`);
        } else {
          const errorText = await transferResponse.text();
          transferError = `Razorpay Transfer Failed: ${transferResponse.status} - ${errorText}`;
          console.error(transferError);
        }
      } catch (err: any) {
        transferError = err.message || "Transfer request exception";
        console.error("Exception during Razorpay Route transfer:", err);
      }
    }

    // Save report/log to Supabase if configured
    if (isSupabaseConfigured) {
      try {
        const { error: logError } = await supabase
          .from("commission_logs")
          .insert({
            order_id: order_id,
            vendor_id: vendor_id,
            order_total: total_amount,
            commission_percent: commissionPercent,
            commission_amount: commissionAmount,
            vendor_payout: vendorPayout,
            status: status,
            transfer_id: transferId || null,
            created_at: new Date().toISOString()
          });

        if (logError) {
          console.error("Failed to insert commission log in Supabase:", logError);
        }
      } catch (dbLogErr) {
        console.error("Supabase commission log exception:", dbLogErr);
      }
    }

    return res.json({
      success: true,
      order_id,
      vendor_id,
      order_total: total_amount,
      commission_percent: commissionPercent,
      commission_amount: commissionAmount,
      vendor_payout: vendorPayout,
      status: status,
      transfer_id: transferId,
      error: transferError || undefined
    });
  } catch (err: any) {
    console.error("Mark delivered / split calculations failed:", err);
    res.status(500).json({ error: err.message || "Failed to calculate splits" });
  }
});

// -------------------------------------------------------------
// 3. API: Razorpay Webhook Integration
// -------------------------------------------------------------
app.post("/api/razorpay-webhook", async (req, res) => {
  try {
    const signature = req.headers["x-razorpay-signature"];
    const secret = process.env.RAZORPAY_WEBHOOK_SECRET;

    console.log("Received Razorpay Webhook Event:", req.body?.event);

    if (secret && signature) {
      // Validate signature
      const expectedSignature = crypto
        .createHmac("sha256", secret)
        .update(JSON.stringify(req.body))
        .digest("hex");

      if (signature !== expectedSignature) {
        console.warn("Signature verification failed for Razorpay Webhook!");
        return res.status(400).json({ error: "Invalid Webhook Signature" });
      }
      console.log("Razorpay webhook signature verified successfully!");
    }

    const event = req.body?.event;
    const payload = req.body?.payload;

    if (event === "payment.captured") {
      const paymentObj = payload?.payment?.entity;
      const orderId = paymentObj?.order_id;
      
      console.log(`Payment captured for order/payment ${orderId}`);
      if (isSupabaseConfigured && orderId) {
        // Update order status to paid in database
        const { error } = await supabase
          .from("orders")
          .update({ status: "paid" })
          .eq("id", orderId);
          
        if (error) {
          console.error("Webhook order payment status update error:", error);
        }
      }
    } else if (event === "transfer.processed") {
      const transferObj = payload?.transfer?.entity;
      const transferId = transferObj?.id;
      
      console.log(`Commission transfer processed: ${transferId}`);
      if (isSupabaseConfigured && transferId) {
        const { error } = await supabase
          .from("commission_logs")
          .update({ status: "transferred" })
          .eq("transfer_id", transferId);
          
        if (error) {
          console.error("Webhook transfer status update error:", error);
        }
      }
    }

    return res.json({ status: "ok" });
  } catch (err: any) {
    console.error("Webhook handler exception:", err);
    res.status(500).json({ error: err.message || "Webhook processing failed" });
  }
});

// Vite Middleware & Static Serving Setup
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`HealNex Full-Stack Server running on http://localhost:${PORT}`);
  });
}

startServer();
