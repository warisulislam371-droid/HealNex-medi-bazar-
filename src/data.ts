import { Category, Product, Blog, User } from './types';

export const INITIAL_CATEGORIES: Category[] = [
  {
    id: 'cat-med-equip',
    name: 'Medical Equipment',
    iconName: 'Activity',
    subcategories: ['ECG Machine', 'Ventilator', 'Defibrillator', 'Patient Monitor', 'Infusion Pump']
  },
  {
    id: 'cat-lab-equip',
    name: 'Laboratory Equipment',
    iconName: 'FlaskConical',
    subcategories: ['Microscope', 'Centrifuge', 'Blood Analyzer', 'Biochemistry Analyzer']
  },
  {
    id: 'cat-dental',
    name: 'Dental Equipment',
    iconName: 'Sparkles',
    subcategories: ['Dental Chair', 'Dental Instruments', 'Dental X-Ray']
  },
  {
    id: 'cat-surgical',
    name: 'Surgical Instruments',
    iconName: 'Scissors',
    subcategories: ['Forceps', 'Retractors', 'Scissors', 'Surgical Kits']
  },
  {
    id: 'cat-furniture',
    name: 'Hospital Furniture',
    iconName: 'Bed',
    subcategories: ['ICU Beds', 'Hospital Beds', 'Stretchers', 'Wheelchairs']
  },
  {
    id: 'cat-homecare',
    name: 'Homecare Devices',
    iconName: 'HeartPulse',
    subcategories: ['BP Monitor', 'Glucometer', 'Nebulizer', 'Oxygen Concentrator', 'Pulse Oximeter']
  },
  {
    id: 'cat-consumables',
    name: 'Consumables',
    iconName: 'Syringe',
    subcategories: ['Gloves', 'Masks', 'Syringes', 'Catheters', 'IV Sets', 'PPE Kits']
  }
];

export const INITIAL_PRODUCTS: Product[] = [
  {
    id: 'prod-ecg-12',
    vendorId: 'vendor-medilink',
    vendorName: 'MediLink Systems Private Limited',
    name: '12-Channel Electrocardiograph (ECG Machine)',
    sku: 'HN-ECG-12CH',
    brand: 'HealNex Premium',
    category: 'Medical Equipment',
    subcategory: 'ECG Machine',
    description: 'Advanced 12-channel digital ECG machine with 7-inch color display, high-resolution thermal printing, built-in rechargeable battery, and automatic interpretation engine.',
    specifications: [
      { key: 'Display', value: '7" TFT Color Screen' },
      { key: 'Lead Selection', value: '12 Leads Standard / Cabrera' },
      { key: 'Frequency Response', value: '0.05Hz - 150Hz' },
      { key: 'Battery Backup', value: '4+ hours continuous monitoring' },
      { key: 'Connectivity', value: 'USB, LAN, SD Card' }
    ],
    price: 65000,
    salePrice: 58000,
    moq: 1,
    stockQuantity: 15,
    hsnCode: '90181100',
    gstRate: 12,
    warranty: '2 Years Manufacturer Warranty',
    countryOfOrigin: 'India',
    images: ['https://images.unsplash.com/photo-1530026405186-ed1ea0ac7a63?auto=format&fit=crop&q=80&w=400'],
    status: 'Approved',
    createdAt: '2026-06-15T10:00:00Z'
  },
  {
    id: 'prod-vent-icu',
    vendorId: 'vendor-medilink',
    vendorName: 'MediLink Systems Private Limited',
    name: 'Enterprise High-Flow ICU Ventilator',
    sku: 'HN-VENT-V8',
    brand: 'RespiCare Pro',
    category: 'Medical Equipment',
    subcategory: 'Ventilator',
    description: 'High-performance ventilator designed for pediatric and adult ICU patients. Features multiple ventilation modes (VCV, PCV, SIMV, PSV, CPAP) and advanced lung recruitment maneuvers.',
    specifications: [
      { key: 'Patient Type', value: 'Adult, Pediatric, Neonatal' },
      { key: 'Ventilation Modes', value: 'VCV, PCV, SIMV, PSV, CPAP, BiPAP' },
      { key: 'Tidal Volume', value: '20ml - 2000ml' },
      { key: 'Oxygenation range', value: '21% - 100%' },
      { key: 'Screen Size', value: '12.1" Touchscreen' }
    ],
    price: 350000,
    salePrice: 310000,
    moq: 1,
    stockQuantity: 5,
    hsnCode: '90192000',
    gstRate: 12,
    warranty: '3 Years Warranty with AMC options',
    countryOfOrigin: 'India',
    images: ['https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&q=80&w=400'],
    status: 'Approved',
    createdAt: '2026-06-16T11:00:00Z'
  },
  {
    id: 'prod-defib-biphasic',
    vendorId: 'vendor-apex',
    vendorName: 'Apex Healthcare Equipment Corp',
    name: 'Biphasic Defibrillator with Monitor & Recorder',
    sku: 'HN-DEF-BIPH',
    brand: 'Lifeshield',
    category: 'Medical Equipment',
    subcategory: 'Defibrillator',
    description: 'Rugged biphasic defibrillator with integrated ECG monitor, AED guidance, manual shock mode, and thermal printer. Ideal for crash carts and ambulance systems.',
    specifications: [
      { key: 'Waveform', value: 'Biphasic Truncated Exponential' },
      { key: 'Energy Range', value: '2J - 360J' },
      { key: 'AED Mode', value: 'Voice & Visual Guidance' },
      { key: 'Printer', value: 'Built-in 50mm Thermal Recorder' }
    ],
    price: 180000,
    salePrice: 165000,
    moq: 1,
    stockQuantity: 8,
    hsnCode: '90189011',
    gstRate: 12,
    warranty: '2 Years Standard Warranty',
    countryOfOrigin: 'Germany',
    images: ['https://images.unsplash.com/photo-1603398938378-e54eab446dde?auto=format&fit=crop&q=80&w=400'],
    status: 'Approved',
    createdAt: '2026-06-17T09:30:00Z'
  },
  {
    id: 'prod-oxy-con',
    vendorId: 'vendor-apex',
    vendorName: 'Apex Healthcare Equipment Corp',
    name: 'Medical Grade Oxygen Concentrator 10L',
    sku: 'HN-OXY-10L',
    brand: 'OxyFlow',
    category: 'Homecare Devices',
    subcategory: 'Oxygen Concentrator',
    description: 'High capacity 10 LPM oxygen concentrator supplying up to 93%+/-3% purity oxygen continuously. Quiet operations, low power consumption, and equipped with a nebulizer function.',
    specifications: [
      { key: 'Oxygen Flow Rate', value: '1 - 10 Litres per Minute' },
      { key: 'Oxygen Purity', value: '93% ± 3% at all flow rates' },
      { key: 'Noise Level', value: '< 45 dB' },
      { key: 'Weight', value: '23 kg' },
      { key: 'Power Consumption', value: '480W' }
    ],
    price: 55000,
    salePrice: 48000,
    moq: 2,
    stockQuantity: 25,
    hsnCode: '90192000',
    gstRate: 12,
    warranty: '1 Year Warranty',
    countryOfOrigin: 'USA',
    images: ['https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&q=80&w=400'],
    status: 'Approved',
    createdAt: '2026-06-18T14:15:00Z'
  },
  {
    id: 'prod-icubed-deluxe',
    vendorId: 'vendor-furniture-pros',
    vendorName: 'Reliable Hospital Furniture India',
    name: '5-Function Motorized ICU Bed',
    sku: 'HN-ICUB-5F',
    brand: 'Hospiluxe',
    category: 'Hospital Furniture',
    subcategory: 'ICU Beds',
    description: 'Fully automated medical ICU bed with 5 essential adjustment functions: Backrest, Kneerest, Height Adjustment, Trendelenburg, and Reverse Trendelenburg. Equipped with high-safety ABS panels and dual side rails.',
    specifications: [
      { key: 'Adjustment System', value: 'Motorized Linear Actuator System' },
      { key: 'Load Capacity', value: '250 kg Safe Working Load' },
      { key: 'Wheels', value: '125mm Silent Castors with Central Locking' },
      { key: 'Panel Material', value: 'Molded ABS head and foot boards' }
    ],
    price: 110000,
    salePrice: 95000,
    moq: 1,
    stockQuantity: 12,
    hsnCode: '94029010',
    gstRate: 18,
    warranty: '5 Years Motor Warranty',
    countryOfOrigin: 'India',
    images: ['https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&q=80&w=400'],
    status: 'Approved',
    createdAt: '2026-06-19T08:00:00Z'
  },
  {
    id: 'prod-nitrile-gloves',
    vendorId: 'vendor-furniture-pros',
    vendorName: 'Reliable Hospital Furniture India',
    name: 'Disposable Blue Nitrile Gloves (Box of 100)',
    sku: 'HN-NGLV-BL',
    brand: 'SafeShield',
    category: 'Consumables',
    subcategory: 'Gloves',
    description: 'Premium latex-free, powder-free medical grade blue nitrile examination gloves. Superior puncture resistance, excellent tactile sensitivity, and textured fingertips.',
    specifications: [
      { key: 'Material', value: 'Nitrile (Latex-Free, Powder-Free)' },
      { key: 'Box Quantity', value: '100 Gloves per box' },
      { key: 'Grade', value: 'AQL 1.5 Medical Grade' },
      { key: 'Certifications', value: 'CE, FDA, EN455' }
    ],
    price: 450,
    salePrice: 390,
    moq: 50, // high MOQ for consumables B2B
    stockQuantity: 1200,
    hsnCode: '40151100',
    gstRate: 5,
    warranty: 'Not Applicable',
    countryOfOrigin: 'Malaysia',
    images: ['https://images.unsplash.com/photo-1583947215259-38e31be8751f?auto=format&fit=crop&q=80&w=400'],
    status: 'Approved',
    createdAt: '2026-06-20T12:00:00Z'
  },
  {
    id: 'prod-centrifuge-clinical',
    vendorId: 'vendor-medilink',
    vendorName: 'MediLink Systems Private Limited',
    name: 'Digital Benchtop Clinical Centrifuge',
    sku: 'HN-LAB-CENT',
    brand: 'LabSpin',
    category: 'Laboratory Equipment',
    subcategory: 'Centrifuge',
    description: 'High speed tabletop centrifuge for blood, serum, and plasma separation. Fitted with micro-computer control, LED panel, speed/RCF conversion, and brushless induction motor.',
    specifications: [
      { key: 'Max Speed', value: '4000 RPM' },
      { key: 'Max RCF', value: '2325 xg' },
      { key: 'Rotor Capacity', value: '8 x 15ml Tubes' },
      { key: 'Timer Range', value: '1 - 99 Minutes' }
    ],
    price: 25000,
    salePrice: 22000,
    moq: 1,
    stockQuantity: 10,
    hsnCode: '84211999',
    gstRate: 18,
    warranty: '1 Year Warranty',
    countryOfOrigin: 'India',
    images: ['https://images.unsplash.com/photo-1576086213369-97a306d36557?auto=format&fit=crop&q=80&w=400'],
    status: 'Approved',
    createdAt: '2026-06-21T15:00:00Z'
  }
];

export const INITIAL_BLOGS: Blog[] = [
  {
    id: 'blog-1',
    title: 'Essential Maintenance Checklist for High-Flow ICU Ventilators',
    content: 'ICU ventilators are critical life-support devices that require immaculate care and periodic maintenance to perform reliably. In this comprehensive guide, we cover daily calibration checks, tubing sterilization protocols, sensor replacements, and backup battery upkeep. Hospitals that implement rigorous routine diagnostics reduce unexpected downtime by over 45%, ensuring constant readiness for emergency acute care scenarios.',
    author: 'Dr. Ramesh Sharma, Biomedical Lead',
    tags: ['Ventilators', 'ICU Maintenance', 'Biomedical Guide'],
    image: 'https://images.unsplash.com/photo-1579684389782-64d84b5e901a?auto=format&fit=crop&q=80&w=500',
    seoTitle: 'ICU Ventilator Maintenance & Calibration Checklist',
    seoDescription: 'A complete clinical and engineering checklist to keep life-support ICU ventilators functioning correctly with zero downtime.',
    createdAt: '2026-06-25T10:00:00Z'
  },
  {
    id: 'blog-2',
    title: 'B2B Medical Procurement Trends for Modern Hospital Systems in 2026',
    content: 'The medical supply chain landscape in India is undergoing a massive digital overhaul. From fragmented regional dealer networks to centralized multi-vendor marketplace platforms, digital adoption is shortening lead times, providing price transparency, and introducing institutional financing tools. We outline how hospital administrators are leveraging digital RFQ bidding sheets to reduce clinical procurement costs by up to 18% this year.',
    author: 'Amitabh Sen, Healthcare Consultant',
    tags: ['Hospital Procurement', 'B2B Marketplace', 'Supply Chain'],
    image: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&q=80&w=500',
    seoTitle: 'B2B Medical Procurement & Hospital Supply Chain Trends 2026',
    seoDescription: 'Explore how digital multi-vendor marketplaces are revolutionizing medical equipment procurement for Indian hospital chains.',
    createdAt: '2026-06-26T12:00:00Z'
  }
];

export const DEFAULT_SUPER_ADMIN: User = {
  id: 'user-superadmin',
  name: 'Super Admin',
  email: 'warisulislam371@gmail.com',
  role: 'super_admin',
  phone: '+91 98765 43210',
  isVerified: true,
  forcePasswordChange: true,
  createdAt: '2026-01-01T00:00:00Z'
};
