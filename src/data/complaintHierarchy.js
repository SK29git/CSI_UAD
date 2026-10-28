/**
 * Complaint Classification Hierarchy and Standardized Metadata
 * Derived from official AGMC CCaaS / CRM mapping.
 */

export const COMPLAINT_BRANCHES = [
  "10 - Sheikh Zayed Rd",
  "11 - Body & Paint Centre",
  "20 - Sharjah",
  "25 - Sajja Yard",
  "30 - Ras Al Khaimah",
  "40 - Deira",
  "50 - Fujairah",
  "60 - Motor City",
  "70 - City Walk",
  "99 - Head Office"
];

export const COMPLAINT_DEPARTMENTS = [
  "Service",
  "Sales",
  "Parts",
  "Accounts",
  "Business Development Centre",
  "Rentals",
  "Balance Sheet"
];

export const COMPLAINT_SOURCES = [
  "Customer Call",
  "Customer Walk-in",
  "Email",
  "AGMC BMW Website",
  "BMW Middle East",
  "CSI",
  "DED",
  "Feedback Form",
  "Happiness Counter",
  "OCMS",
  "Social Media",
  "VOC"
];

export const COMPLAINT_PRIORITIES = [
  "Urgent",
  "Normal"
];

export const COMPLAINT_HIERARCHY = {
  "Service": {
    "Process": [
      "Alternate transport - lack of drivers",
      "Booking period too long",
      "Delay in file creation/ adding vehicle",
      "Delay in insurance approval",
      "Delay in preparing service & warranty confirmation letter",
      "Delay in preparing service history letter",
      "Expensive Labor",
      "Inspection charge",
      "Issue after last visit",
      "Lack of Manpower",
      "Manufacturing product failure",
      "Non replenishment of tools",
      "Part Not Available Job incomplete - back order",
      "Pick and Drop- Scheduling and planning",
      "Process Change- T&C",
      "Process Delay",
      "Provide loaner car",
      "Repair period too long",
      "Repeated issue",
      "Required Documents",
      "Roadside assistance",
      "Service/ Warranty duration",
      "Unavailability of Arabic Speaking Staff",
      "Warranty -Extension delayed",
      "Warranty Claim"
    ],
    "Staff": [
      "Attitude and behavior",
      "Customer current details not updated",
      "Customer Handling Skills",
      "Delay in providing quotation",
      "Delay in starting the job",
      "Didn't apply discount",
      "Didn't seek approval from the customer before repair/service",
      "Handover / informing the customer about the job carried out",
      "Improper scheduling",
      "Inappropriate tech Knowledge background",
      "Incorrect/Incomplete Information",
      "informing the customer about collection time",
      "Internal Damage/Accident",
      "Item missing",
      "Job card payment issue",
      "Lack of Pro-Activeness",
      "Lack of supervision by team leader",
      "Long waiting time dopping/collecting vehicles",
      "No prompt follow-up",
      "Not following the process",
      "Not offered alternate transportation",
      "Quality check not performed - Mechanical check",
      "Quality check not performed - Washing",
      "Service not updated on the system",
      "Wrong diagnosis"
    ],
    "Facility": [
      "Delivery Area",
      "Front desk crowded",
      "Inspection area",
      "Lack of hospitality",
      "Limited Space",
      "Parking space",
      "Service center hygiene",
      "Service center temperature",
      "Waiting Area"
    ],
    "Customer": [
      "Attitude and Customer approach against the Staff",
      "Customer early/late arrival",
      "Customer unwilling to remove items",
      "Incorrect/Incomplete Information",
      "The customer is not happy with the process",
      "The customer is not happy with the product",
      "The customer is not happy with the service",
      "The customer is not happy with the working hours"
    ],
    "Technical": [
      "Autoline issue",
      "Car noise / vibration",
      "Car software issue",
      "Connected drive issue",
      "Online Booking Integration (website and autoline)",
      "Product failure",
      "Telephone System - not advanced"
    ]
  },
  "Sales": {
    "Process": [
      "Demo car availability",
      "Insurance Policy",
      "Lack of Manpower",
      "Payment restrictions",
      "Pre-delivery inspection",
      "Process Change- T&C",
      "Process Delay",
      "Registration process",
      "Required Documents",
      "Stock availability",
      "Trade-in process",
      "Unavailability for the customer language",
      "Welcome gift"
    ],
    "Staff": [
      "Attitude and Behavior",
      "Car delivery delay",
      "Delay in test drive",
      "Explanation of car features",
      "Incorrect/Incomplete Information",
      "Lack of Pro-Activeness",
      "Lack of product knowledge",
      "Meet and Greet",
      "No prompt follow-up",
      "No test drive offered",
      "Not following the process",
      "Test drive routing",
      "Vehicle handover Experience"
    ],
    "Facility": [
      "Delivery Area",
      "Front desk crowded",
      "Lack of hospitality",
      "Limited Space",
      "Parking space",
      "Showroom Hygiene",
      "Showroom Layout",
      "Showroom Smell",
      "Showroom Temperature",
      "Waiting Area"
    ],
    "Customer": [
      "Attitude and Behavior",
      "Customer not happy with the evaluation",
      "Extend the PG session time",
      "Incorrect/Incomplete Information",
      "Short test drive duration",
      "The customer is not happy with the process",
      "The customer is not happy with the product",
      "The customer is not happy with the working hours"
    ],
    "Technical": [
      "Delivery stoppage - recall campaign",
      "Product issue"
    ]
  },
  "Parts": {
    "Process": [
      "Delay to receive the parts",
      "Expensive Parts",
      "Lack of Manpower",
      "Parts not available in the factory",
      "Process Change T&C",
      "Product Failure",
      "Require Documents",
      "Unavailability for the customer language",
      "Unavailability of parts"
    ],
    "Staff": [
      "Attitude and Behavior",
      "Customer current details not updated",
      "Customer Handling Skills",
      "Delay in placing the order",
      "Incorrect/Incomplete Information",
      "Lack of Pro-Activeness",
      "No Prompt Follow-Up",
      "Not Following the process"
    ],
    "Customer": [
      "Attitude and Customer approach of the staff",
      "Incorrect/Incomplete Information",
      "The customer is not happy with the process",
      "The customer is not happy with the product",
      "The customer is not happy with the working hours"
    ],
    "Facility": [
      "Limited Space",
      "Waiting Area"
    ],
    "Technical": [
      "System Issue",
      "Telephone System - Not Advanced"
    ]
  },
  "Accounts": {
    "Staff": [
      "Attitude and Behavior",
      "Customer Current details not updated",
      "Customer Handling Skills",
      "Delay in stating the process",
      "Incorrect/Incomplete Information",
      "Lack of Pro-Activeness",
      "No prompt Follow-up",
      "Not following the process"
    ],
    "Process": [
      "Delay in Refund Process",
      "Delay of online payment",
      "Process Change - T&C",
      "Required Documents",
      "Unavailability for the customer language"
    ],
    "Customer": [
      "Attitude and Customer Approach of the staff",
      "Incorrect/Incomplete Information",
      "The Customer is not happy with the process",
      "The customer is not happy with the working hours"
    ],
    "Technical": [
      "Payment System",
      "System Issue",
      "Telephone System - Not Advanced"
    ]
  },
  "Business Development Centre": {
    "Staff": [
      "Attitude and Behavior",
      "Communication Gap",
      "Customer current details not updated",
      "Customer Handling Skills",
      "Didn't arrange pickup/drop-off on time",
      "Empathy",
      "Incorrect Booking",
      "Incorrect/Incomplete information",
      "Lack of Knowledge",
      "Language Problem",
      "No Prompt Follow-up",
      "Not following the process"
    ],
    "Technical": [
      "Autoline issue",
      "B2B System",
      "Email",
      "ISPA",
      "Marketing Agreement (SMS/Email/WhatsApp)",
      "Payment Link portal",
      "S-Gate",
      "Salesforce",
      "Social Media/Chat Platform",
      "Telephone System - Not Advanced",
      "Zofeur Portal"
    ],
    "Process": [
      "Communications",
      "Delay from Third Party Driver Provider",
      "Delay from Third Party Recovery Provider",
      "Marketing updated information",
      "Unavailability of Arabic Speaking Staff"
    ],
    "Customer": [
      "Attitude and Customer approach of the staff",
      "Incorrect/Incomplete Information",
      "The customer is not happy with the process",
      "The customer is not happy with the working hours"
    ],
    "Facility": [
      "Background Noise"
    ]
  },
  "Rentals": {
    "Process": [
      "Car Condition",
      "Lack of Manpower",
      "Long Process",
      "Process Change - T&C",
      "Required Documents",
      "Unavailability for the customer language"
    ],
    "Staff": [
      "Attitude and Behavior",
      "Customer current details not updated",
      "Incorrect/Incomplete information",
      "No Prompt Follow-up",
      "Not following the process",
      "Process Delay"
    ],
    "Customer": [
      "Attitude and Customer approach of the staff",
      "Disagreed with T&C",
      "Incorrect/Incomplete information"
    ]
  },
  "Balance Sheet": {
    "General": [
      "Invoice / Billing Query",
      "Payment Discrepancy",
      "General Inquiry",
      "Statement of Account",
      "Other Balance Sheet Request"
    ]
  }
};

/**
 * Returns available groups for a given department.
 * @param {string} department
 * @returns {string[]}
 */
export function getGroupsForDepartment(department) {
  if (!department || !COMPLAINT_HIERARCHY[department]) {
    // Default fallback to Service groups
    return Object.keys(COMPLAINT_HIERARCHY["Service"]);
  }
  return Object.keys(COMPLAINT_HIERARCHY[department]);
}

/**
 * Returns available categories for a given department and group.
 * @param {string} department
 * @param {string} group
 * @returns {string[]}
 */
export function getCategoriesForDepartmentAndGroup(department, group) {
  if (!department || !COMPLAINT_HIERARCHY[department]) {
    return COMPLAINT_HIERARCHY["Service"]["Process"] || [];
  }
  const deptGroups = COMPLAINT_HIERARCHY[department];
  if (!group || !deptGroups[group]) {
    // Return first available group's categories
    const firstGroup = Object.keys(deptGroups)[0];
    return deptGroups[firstGroup] || [];
  }
  return deptGroups[group] || [];
}
