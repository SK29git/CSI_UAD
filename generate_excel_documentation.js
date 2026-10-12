import ExcelJS from 'exceljs';
import path from 'path';

async function generateDocumentation() {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'AGMC Digital Solutions & Development Team';
  workbook.lastModifiedBy = 'AGMC Digital Solutions';
  workbook.created = new Date();
  workbook.modified = new Date();

  // Color Palette Constants
  const NAVY_DARK = '1F4E79';     // #1F4E79 - Main Headers
  const BLUE_HEADER = '2E75B6';   // #2E75B6 - Secondary Headers
  const BLUE_LIGHT = 'D9E1F2';    // #D9E1F2 - Accent Rows / Subheaders
  const BLUE_TINT = 'EDF2F8';     // #EDF2F8 - Alternating Zebra rows
  const WHITE = 'FFFFFF';
  const BORDER_COLOR = 'D9D9D9';
  const METHOD_GET = 'E1F0DA';     // Light Green
  const METHOD_POST = 'D6E4F0';    // Soft Light Blue
  const METHOD_PUT = 'FFF3CD';     // Light Amber
  const METHOD_DELETE = 'F8D7DA';  // Light Red

  const borderAll = {
    top: { style: 'thin', color: { argb: BORDER_COLOR } },
    left: { style: 'thin', color: { argb: BORDER_COLOR } },
    bottom: { style: 'thin', color: { argb: BORDER_COLOR } },
    right: { style: 'thin', color: { argb: BORDER_COLOR } }
  };

  const headerStyle = {
    font: { name: 'Calibri', size: 11, bold: true, color: { argb: WHITE } },
    fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: NAVY_DARK } },
    alignment: { vertical: 'middle', horizontal: 'center', wrapText: true },
    border: borderAll
  };

  const subHeaderStyle = {
    font: { name: 'Calibri', size: 10, bold: true, color: { argb: '002060' } },
    fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: BLUE_LIGHT } },
    alignment: { vertical: 'middle', horizontal: 'left', wrapText: true },
    border: borderAll
  };

  // ==========================================
  // SHEET 1: EXECUTIVE SUMMARY
  // ==========================================
  const sheet1 = workbook.addWorksheet('Executive Summary', {
    views: [{ showGridLines: true }]
  });

  sheet1.columns = [
    { width: 5 },
    { width: 32 },
    { width: 55 },
    { width: 25 }
  ];

  // Title Block
  sheet1.mergeCells('B2:D2');
  const titleCell = sheet1.getCell('B2');
  titleCell.value = 'AGMC CUSTOMER EXPERIENCE & OPERATIONS PORTAL';
  titleCell.font = { name: 'Calibri', size: 16, bold: true, color: { argb: WHITE } };
  titleCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: NAVY_DARK } };
  titleCell.alignment = { vertical: 'middle', horizontal: 'center' };
  sheet1.getRow(2).height = 36;

  sheet1.mergeCells('B3:D3');
  const subTitleCell = sheet1.getCell('B3');
  subTitleCell.value = 'Complete Application Screens, Menus, Customer Profile & API Catalog Matrix';
  subTitleCell.font = { name: 'Calibri', size: 11, italic: true, color: { argb: '333333' } };
  subTitleCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: BLUE_LIGHT } };
  subTitleCell.alignment = { vertical: 'middle', horizontal: 'center' };
  sheet1.getRow(3).height = 24;

  // Metadata Table
  const metaRows = [
    ['Base API URL', 'https://ccaas.agmcgroup.ae', 'Production / UAT Gateway'],
    ['Authentication / Origin', 'Direct Keyloop & Desktop Interface', 'Dealer-local (+04:00)'],
    ['Frontend Framework', 'React 19 + React Router v7 + Vite 8 + Tailwind CSS', 'Modern SPA Architecture'],
    ['Keyloop Group Brands', 'BMW, MINI, Motorrad, Rolls-Royce', 'Multi-brand Tenant Support'],
    ['Documentation Generated', new Date().toLocaleDateString('en-GB') + ' ' + new Date().toLocaleTimeString('en-GB'), 'Automated Audit']
  ];

  sheet1.getCell('B5').value = 'System Architecture & Gateway Parameters';
  sheet1.getCell('B5').font = { name: 'Calibri', size: 12, bold: true, color: { argb: '002060' } };

  metaRows.forEach((r, idx) => {
    const rowNum = 6 + idx;
    sheet1.getCell(`B${rowNum}`).value = r[0];
    sheet1.getCell(`B${rowNum}`).font = { name: 'Calibri', size: 10, bold: true };
    sheet1.getCell(`B${rowNum}`).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: BLUE_TINT } };
    sheet1.getCell(`B${rowNum}`).border = borderAll;

    sheet1.getCell(`C${rowNum}`).value = r[1];
    sheet1.getCell(`C${rowNum}`).font = { name: 'Calibri', size: 10 };
    sheet1.getCell(`C${rowNum}`).border = borderAll;

    sheet1.getCell(`D${rowNum}`).value = r[2];
    sheet1.getCell(`D${rowNum}`).font = { name: 'Calibri', size: 10, italic: true, color: { argb: '555555' } };
    sheet1.getCell(`D${rowNum}`).border = borderAll;
    sheet1.getRow(rowNum).height = 20;
  });

  // Modules Summary Table
  sheet1.getCell('B13').value = 'Application Modules & Screens Inventory Summary';
  sheet1.getCell('B13').font = { name: 'Calibri', size: 12, bold: true, color: { argb: '002060' } };

  const summaryHeaders = ['Module / Menu Area', 'Submenu Views / Tabs', 'Total Integrated APIs', 'Primary Purpose'];
  sheet1.mergeCells('B14:B14');
  sheet1.getCell('B14').value = summaryHeaders[0];
  sheet1.getCell('C14').value = summaryHeaders[1];
  sheet1.getCell('D14').value = summaryHeaders[2];
  ['B14', 'C14', 'D14'].forEach(c => {
    sheet1.getCell(c).style = headerStyle;
  });
  sheet1.getRow(14).height = 25;

  const moduleStats = [
    ['Customer Profile (Global 360)', 'Left Sidebar, Verification, Risk, Multi-Account, Vehicles', '14 APIs', 'Customer 360 view, mobile caller lookup, credit/insurance & verification'],
    ['Complaints Manager', 'Overview, Create Complaint, Open Complaints, Recovery Actions, Assign Complaint, Resolve Complaint', '9 APIs', 'Complete complaint lifecycle, escalation management, recovery actions, and resolution'],
    ['Sales Portal', 'Overview, New Lead, Enquiries, Test Drive, Vehicle Orders, Customer Segments, After-Sales', '14 APIs', 'Lead acquisition, Keyloop enquiries, test drive scheduling, vehicle order tracking & segments'],
    ['Service & Booking', 'Overview, Book Service, Open Bookings, Service History, Warranty Claims, Service Feedback', '12 APIs', 'Workshop bookings, WIP tracking, vehicle service history, warranty claims & feedback'],
    ['Feedback & CSAT', 'Overview, CSI, NPS, Lost Sales Analysis, Open Bookings', '6 APIs', 'Customer satisfaction scores, NPS surveys, and lost sale analytics'],
    ['IMEI Tracker', 'Real-time GPS Tracking, Map Overlay, Device Search', '1 API', 'Real-time device tracking via 15-digit IMEI with GPS coordinates and interactive map']
  ];

  moduleStats.forEach((st, idx) => {
    const rowNum = 15 + idx;
    sheet1.getCell(`B${rowNum}`).value = st[0];
    sheet1.getCell(`B${rowNum}`).font = { name: 'Calibri', size: 10, bold: true };
    sheet1.getCell(`B${rowNum}`).fill = { type: 'pattern', pattern: 'solid', fgColor: idx % 2 === 0 ? { argb: WHITE } : { argb: BLUE_TINT } };
    sheet1.getCell(`B${rowNum}`).border = borderAll;

    sheet1.getCell(`C${rowNum}`).value = st[1];
    sheet1.getCell(`C${rowNum}`).font = { name: 'Calibri', size: 9 };
    sheet1.getCell(`C${rowNum}`).fill = { type: 'pattern', pattern: 'solid', fgColor: idx % 2 === 0 ? { argb: WHITE } : { argb: BLUE_TINT } };
    sheet1.getCell(`C${rowNum}`).border = borderAll;

    sheet1.getCell(`D${rowNum}`).value = st[2];
    sheet1.getCell(`D${rowNum}`).font = { name: 'Calibri', size: 10, bold: true, color: { argb: '002060' } };
    sheet1.getCell(`D${rowNum}`).alignment = { horizontal: 'center', vertical: 'middle' };
    sheet1.getCell(`D${rowNum}`).fill = { type: 'pattern', pattern: 'solid', fgColor: idx % 2 === 0 ? { argb: WHITE } : { argb: BLUE_TINT } };
    sheet1.getCell(`D${rowNum}`).border = borderAll;
    sheet1.getRow(rowNum).height = 24;
  });

  // ==========================================
  // SHEET 2: ALL SCREENS & MENUS
  // ==========================================
  const sheet2 = workbook.addWorksheet('Screens & Menus', {
    views: [{ showGridLines: true }]
  });

  sheet2.columns = [
    { header: '#', key: 'id', width: 5 },
    { header: 'Module / Menu', key: 'module', width: 20 },
    { header: 'Route Path', key: 'route', width: 16 },
    { header: 'Submenu / Tab Name', key: 'submenu', width: 24 },
    { header: 'Component File', key: 'component', width: 30 },
    { header: 'Key Functional Features & User Workflow', key: 'features', width: 45 },
    { header: 'Associated API Endpoints', key: 'apis', width: 48 },
    { header: 'API Count', key: 'apiCount', width: 10 }
  ];

  sheet2.getRow(1).height = 30;
  sheet2.getRow(1).eachCell(cell => {
    cell.style = headerStyle;
  });

  const screensData = [
    // Customer 360
    {
      id: 1,
      module: 'Customer Profile',
      route: 'Global (All Pages)',
      submenu: 'Customer 360 & Search',
      component: 'LeftSidebar.jsx / CustomerContext.jsx',
      features: 'Mobile lookup (Caller ID discovery), Customer selector dropdown for multiple accounts, VIP status, contact details, branch, consents, verification badge, and risk level card',
      apis: 'GET /api/v1/customers?group={g}&mobile={m}\nGET /api/v1/customers?group={g}&customerNumber={c}\nGET /api/v1/customers/{g}/{c}/profile\nGET /api/v1/customers/{g}/{c}/verification\nGET /api/v1/customers/{g}/{c}/risk-overview',
      apiCount: 5
    },
    {
      id: 2,
      module: 'Customer Profile',
      route: 'Global (All Pages)',
      submenu: 'Customer Vehicles & Activity',
      component: 'RightSidebar.jsx / ServiceCustomerVehicleCard.jsx',
      features: 'Customer vehicle carousel/selector (VIN, brand, model, colour, odometer, warranty, service contract) + Real-time complaint timeline with priority filters',
      apis: 'GET /api/v1/vehicles?group={g}&customerNumber={c}\nGET /api/v1/vehicles/{g}/{vin}\nGET /api/v1/customers/{g}/{c}/complaints?limit=50',
      apiCount: 3
    },
    // Complaints Dashboard
    {
      id: 3,
      module: 'Complaints Manager',
      route: '/ or /complaints',
      submenu: 'Overview',
      component: 'OverviewView.jsx',
      features: 'High-level summary of customer complaints, open vs closed tickets breakdown, ticket volume status, quick escalation alerts',
      apis: 'GET /api/v1/complaints?group={g}&customerNumber={c}&status=all\nGET /api/v1/complaints?group={g}&customerNumber={c}&status=open',
      apiCount: 2
    },
    {
      id: 4,
      module: 'Complaints Manager',
      route: '/ or /complaints',
      submenu: 'Create Complaint',
      component: 'CreateComplaintView.jsx',
      features: 'Form to lodge new customer complaints with category, branch, priority, detailed description, auto-agent identification',
      apis: 'POST /api/v1/complaints',
      apiCount: 1
    },
    {
      id: 5,
      module: 'Complaints Manager',
      route: '/ or /complaints',
      submenu: 'Open Complaints',
      component: 'OpenComplaintsView.jsx',
      features: 'Lists all open active complaint tickets for the selected customer, origin badge (KEYLOOP vs DESKTOP), category, and creation date',
      apis: 'GET /api/v1/complaints?group={g}&customerNumber={c}&status=open',
      apiCount: 1
    },
    {
      id: 6,
      module: 'Complaints Manager',
      route: '/ or /complaints',
      submenu: 'Recovery Actions',
      component: 'RecoveryActionsView.jsx',
      features: 'Select complaint ticket, view existing recovery action, create new recovery action, update recovery action against actionId, cancel action. Zero dummy data.',
      apis: 'GET /api/v1/complaints?group={g}&customerNumber={c}&status=all\nGET /api/v1/complaints/{g}/{cid}/recovery-actions\nPOST /api/v1/complaints/{g}/{cid}/recovery-actions\nPUT /api/v1/complaints/{g}/{cid}/recovery-actions/{aid}\nDELETE /api/v1/complaints/{g}/{cid}/recovery-actions/{aid}',
      apiCount: 5
    },
    {
      id: 7,
      module: 'Complaints Manager',
      route: '/ or /complaints',
      submenu: 'Assign Complaint',
      component: 'AssignComplaintView.jsx',
      features: 'Real-time assignment status badge (ASSIGNED vs UNASSIGNED), ticket selector, allocation form to assign/reassign to agent or unassign ticket. Zero dummy fields.',
      apis: 'GET /api/v1/complaints?group={g}&customerNumber={c}\nGET /api/v1/complaints/{g}/{cid}/assignment\nPUT /api/v1/complaints/{g}/{cid}/assignment',
      apiCount: 3
    },
    {
      id: 8,
      module: 'Complaints Manager',
      route: '/ or /complaints',
      submenu: 'Resolve Complaint',
      component: 'ResolveComplaintView.jsx',
      features: 'Live resolution status (OPEN vs RESOLVED), formal closure with resolution code (Apology, Goodwill Gesture, etc.) and resolution notes. Locks form when resolved.',
      apis: 'GET /api/v1/complaints?group={g}&customerNumber={c}\nGET /api/v1/complaints/{g}/{cid}/resolution\nPOST /api/v1/complaints/{g}/{cid}/resolve',
      apiCount: 3
    },
    // Sales Module
    {
      id: 9,
      module: 'Sales Portal',
      route: '/sales',
      submenu: 'Overview',
      component: 'SalesOverviewView.jsx',
      features: 'Comprehensive 360 sales snapshot: Active vehicles, finance agreements, insurance policies, trade-in history, sales summary',
      apis: 'GET /api/v1/customers/{g}/{c}/sales-screen\nGET /api/v1/customers/{g}/{c}/vehicles\nGET /api/v1/customers/{g}/{c}/finance\nGET /api/v1/customers/{g}/{c}/insurance\nGET /api/v1/customers/{g}/{c}/trade-in-history\nGET /api/v1/customers/{g}/{c}/sales-summary',
      apiCount: 6
    },
    {
      id: 10,
      module: 'Sales Portal',
      route: '/sales',
      submenu: 'New Lead',
      component: 'SalesNewLeadView.jsx',
      features: 'Lead capture form: customer contact info, vehicle interest, test drive request, purchase timeline, escalation to complaint creation',
      apis: 'POST /api/v1/leads\nGET /api/v1/leads?group={g}&mobile={m}\nPOST /api/v1/complaints\nGET /api/v1/complaints?group={g}&customerNumber={c}&status=all',
      apiCount: 4
    },
    {
      id: 11,
      module: 'Sales Portal',
      route: '/sales',
      submenu: 'Enquiries',
      component: 'SalesEnquiriesView.jsx',
      features: 'Keyloop enquiries list: WON/LOST badges, order/invoice details, branch & sales executive, expandable record with enrolled journeys (J01 showroom, J03 delivery)',
      apis: 'GET /api/v1/enquiries?group={g}&mobile={m}&make={make}&model={model}\nGET /api/v1/enquiries?group={g}&mobile={m}&status=open\nGET /api/v1/enquiries?group={g}&customerNumber={c}&make={make}\nGET /api/v1/enquiries/{g}/{enquiryNumber}',
      apiCount: 4
    },
    {
      id: 12,
      module: 'Sales Portal',
      route: '/sales',
      submenu: 'Test Drive',
      component: 'SalesTestDriveView.jsx',
      features: 'Test drive booking panel, real-time available time-slot lookup by branch/date/model, active booking history, advisor assignment',
      apis: 'GET /api/v1/test-drives/available-slots?group={g}&branch={b}&date={d}&model={m}\nGET /api/v1/test-drives?group={g}&mobile={m}\nGET /api/v1/test-drives?group={g}&prospectNumber={p}\nPOST /api/v1/test-drives',
      apiCount: 4
    },
    {
      id: 13,
      module: 'Sales Portal',
      route: '/sales',
      submenu: 'Vehicle Orders',
      component: 'SalesVehicleOrdersView.jsx',
      features: 'Tracking vehicle orders & delivery pipeline: Production stages, shipment updates, RTA vehicle registration progress, readiness for handover checklist',
      apis: 'GET /api/v1/enquiries?group={g}&mobile={m}&status=all\nGET /api/v1/orders/{g}/{enquiryNo}\nGET /api/v1/orders/{g}/{enquiryNo}/production\nGET /api/v1/orders/{g}/{enquiryNo}/shipment\nGET /api/v1/orders/{g}/{enquiryNo}/registration\nGET /api/v1/orders/{g}/{enquiryNo}/milestones\nGET /api/v1/orders/{g}/{enquiryNo}/vehicle-ready',
      apiCount: 7
    },
    {
      id: 14,
      module: 'Sales Portal',
      route: '/sales',
      submenu: 'Customer Segments',
      component: 'SalesSegmentsView.jsx',
      features: 'Customer segmentation profiling: VIP tier, loyalty status, high-net-worth segment classification, upgrade propensity',
      apis: 'GET /api/v1/customers/segments?group={g}&customerNumber={c}',
      apiCount: 1
    },
    {
      id: 15,
      module: 'Sales Portal',
      route: '/sales',
      submenu: 'After-Sales & Follow Up',
      component: 'SalesAfterSalesView.jsx',
      features: 'After-sales relationship tracking: Vehicle delivery follow-up, service booking history, customer contact logs, next action reminders',
      apis: 'GET /api/v1/vehicles?group={g}&customerNumber={c}\nGET /api/v1/customers/{g}/{c}/service-bookings\nPOST /api/v1/customers/{g}/{c}/follow-ups',
      apiCount: 3
    },
    // Service Module
    {
      id: 16,
      module: 'Service & Booking',
      route: '/service',
      submenu: 'Overview',
      component: 'ServiceOverviewView.jsx',
      features: 'Live vehicle health dashboard: Next service due date & km, last service history, warranty package status, active service inclusive contract',
      apis: 'GET /api/v1/vehicles/{g}/{vin}/next-service\nGET /api/v1/vehicles/{g}/{vin}/last-service\nGET /api/v1/vehicles/{g}/{vin}/warranty\nGET /api/v1/vehicles/{g}/{vin}/service-contract',
      apiCount: 4
    },
    {
      id: 17,
      module: 'Service & Booking',
      route: '/service',
      submenu: 'Book Service',
      component: 'ServiceBookingMainPanel.jsx',
      features: 'Workshop booking workbench: Request service appointment, package eligibility check, WIP booking creation, booking confirmation slip, reminder dispatch, recommended packages',
      apis: 'GET /api/v1/customers/{g}/{c}/requests\nPOST /api/v1/customers/{g}/{c}/requests\nPOST /api/v1/service-bookings\nGET /api/v1/vehicles/{g}/{vin}/service-eligibility\nGET /api/v1/service-bookings/{g}/{wip}\nGET /api/v1/service-bookings/{g}/{wip}/confirmation\nGET /api/v1/service-bookings/{g}/{wip}/reminder\nGET /api/v1/vehicles/{g}/{vin}/service-recommendation',
      apiCount: 8
    },
    {
      id: 18,
      module: 'Service & Booking',
      route: '/service',
      submenu: 'Open Bookings',
      component: 'ServiceOpenBookingsView.jsx',
      features: 'Active workshop jobs: List open appointments, assigned service advisor, WIP number, scheduled time, service job description',
      apis: 'GET /api/v1/customers/{g}/{c}/service-bookings?status=open',
      apiCount: 1
    },
    {
      id: 19,
      module: 'Service & Booking',
      route: '/service',
      submenu: 'Service History',
      component: 'ServiceHistoryView.jsx',
      features: 'Historical vehicle maintenance timeline: Previous work orders, invoice numbers, service date, mileage recorded, operations performed',
      apis: 'GET /api/v1/vehicles/{g}/{vin}/service-history',
      apiCount: 1
    },
    {
      id: 20,
      module: 'Service & Booking',
      route: '/service',
      submenu: 'Warranty Claims',
      component: 'ServiceWarrantyClaimsView.jsx',
      features: 'Historical & active manufacturer warranty claims: Claim ID, defect code, claimed parts, status (APPROVED / REJECTED / PENDING)',
      apis: 'GET /api/v1/vehicles/{g}/{vin}/warranty-claims',
      apiCount: 1
    },
    {
      id: 21,
      module: 'Service & Booking',
      route: '/service',
      submenu: 'Service Feedback',
      component: 'ServiceFeedbackView.jsx',
      features: 'Post-service customer feedback ratings, survey remarks, workshop satisfaction scores',
      apis: 'GET /api/v1/customers/{g}/{c}/feedback',
      apiCount: 1
    },
    // Feedback Module
    {
      id: 22,
      module: 'Feedback & CSAT',
      route: '/feedback',
      submenu: 'Overview / All Tabs',
      component: 'FeedbackOverviewView.jsx',
      features: 'Customer Feedback Hub: CSI aggregate scores, actual customer survey responses, historical feedback logs, submit new feedback record',
      apis: 'GET /api/v1/feedback/csi-score?group={g}&customerNumber={c}\nGET /api/v1/customers/{g}/{c}/csi-responses\nGET /api/v1/customers/{g}/{c}/feedback?from=2026-01-01&to=2027-12-31\nPOST /api/v1/feedback',
      apiCount: 4
    },
    {
      id: 23,
      module: 'Feedback & CSAT',
      route: '/feedback',
      submenu: 'Lost Sales Analysis',
      component: 'FeedbackOverviewView.jsx',
      features: 'Detailed lost sale review: Loss reason codes (e.g. LL9 Open > 30 Days), loss date, lost vehicle model, branch-level loss breakdown',
      apis: 'GET /api/v1/lost-sales/reasons?group={g}&branch={b}\nGET /api/v1/lost-sales?group={g}&customerNumber={c}',
      apiCount: 2
    },
    // IMEI Tracker Module
    {
      id: 24,
      module: 'IMEI Tracker',
      route: '/tracker',
      submenu: 'Live GPS Tracking',
      component: 'IMEITrackerPage.jsx',
      features: 'Live telematics tracking: Search by 15-digit IMEI, interactive Leaflet map with pulsing pin, coordinates, battery level, online/offline status, recent search history',
      apis: 'POST http://localhost:3001/api/devices/track',
      apiCount: 1
    }
  ];

  screensData.forEach((s, idx) => {
    const row = sheet2.addRow(s);
    row.height = 36;
    const isEven = idx % 2 === 0;
    row.eachCell((cell, colNum) => {
      cell.border = borderAll;
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: isEven ? { argb: WHITE } : { argb: BLUE_TINT } };
      cell.font = { name: 'Calibri', size: 9 };
      cell.alignment = { vertical: 'middle', wrapText: true };
      if (colNum === 1 || colNum === 8) {
        cell.alignment = { vertical: 'middle', horizontal: 'center' };
        if (colNum === 8) cell.font = { name: 'Calibri', size: 10, bold: true, color: { argb: '002060' } };
      }
      if (colNum === 2) cell.font = { name: 'Calibri', size: 9, bold: true };
    });
  });

  // ==========================================
  // SHEET 3: CUSTOMER PROFILE MAPPING
  // ==========================================
  const sheet3 = workbook.addWorksheet('Customer Profile Mapping', {
    views: [{ showGridLines: true }]
  });

  sheet3.columns = [
    { header: '#', key: 'id', width: 5 },
    { header: 'Profile Component / Panel', key: 'panel', width: 22 },
    { header: 'Data Field / Attribute', key: 'field', width: 22 },
    { header: 'Data Type', key: 'type', width: 12 },
    { header: 'API Endpoint Source', key: 'api', width: 44 },
    { header: 'HTTP Method', key: 'method', width: 10 },
    { header: 'Data Origin', key: 'origin', width: 14 },
    { header: 'Business Meaning & Display Logic', key: 'description', width: 48 }
  ];

  sheet3.getRow(1).height = 30;
  sheet3.getRow(1).eachCell(cell => {
    cell.style = headerStyle;
  });

  const profileMappingData = [
    {
      id: 1,
      panel: 'Top Bar / Search Header',
      field: 'Mobile Number Search',
      type: 'String (Phone)',
      api: 'GET /api/v1/customers?group={group}&mobile={mobile}',
      method: 'GET',
      origin: 'Keyloop Core',
      description: 'Finds customer records matching caller ID or typed phone number across BMW, MINI, Motorrad, Rolls-Royce'
    },
    {
      id: 2,
      panel: 'Top Bar / Search Header',
      field: 'Customer Number Search',
      type: 'String (ID)',
      api: 'GET /api/v1/customers?group={group}&customerNumber={custNo}',
      method: 'GET',
      origin: 'Keyloop Core',
      description: 'Direct search when Keyloop customer number is known (e.g. 378171, 80496)'
    },
    {
      id: 3,
      panel: 'Left Sidebar / Profile',
      field: 'Account Selector',
      type: 'Array of Accounts',
      api: 'GET /api/v1/customers?mobile={mobile}',
      method: 'GET',
      origin: 'Keyloop Core',
      description: 'Handles customers with multiple records/dealership accounts under same mobile. Shows dropdown when > 1 account'
    },
    {
      id: 4,
      panel: 'Left Sidebar / Profile',
      field: 'Customer Full Name',
      type: 'String',
      api: 'GET /api/v1/customers/{group}/{custNo}/profile',
      method: 'GET',
      origin: 'Keyloop Core',
      description: 'Salutation, First Name, Middle Name, Surname combined into formatted full name'
    },
    {
      id: 5,
      panel: 'Left Sidebar / Profile',
      field: 'VIP Status Indicator',
      type: 'Boolean',
      api: 'GET /api/v1/customers/{group}/{custNo}/profile',
      method: 'GET',
      origin: 'Keyloop Core',
      description: 'Gold VIP badge rendered when vip === true'
    },
    {
      id: 6,
      panel: 'Left Sidebar / Profile',
      field: 'Loyalty Tier',
      type: 'String',
      api: 'GET /api/v1/customers/{group}/{custNo}/profile',
      method: 'GET',
      origin: 'Keyloop Core',
      description: 'Purple pill badge for loyalty tier (e.g. PLATINUM, GOLD, SILVER)'
    },
    {
      id: 7,
      panel: 'Left Sidebar / Profile',
      field: 'Masked Phone & Email',
      type: 'String (Masked)',
      api: 'GET /api/v1/customers/{group}/{custNo}/profile',
      method: 'GET',
      origin: 'Keyloop Core',
      description: 'Masked per security policy (+*********574 / a***@example.com)'
    },
    {
      id: 8,
      panel: 'Left Sidebar / Profile',
      field: 'Geographic Location',
      type: 'Object',
      api: 'GET /api/v1/customers/{group}/{custNo}/profile',
      method: 'GET',
      origin: 'Keyloop Core',
      description: 'Flat/Building, Area, and City (e.g. Umm Suqeim First, Dubai)'
    },
    {
      id: 9,
      panel: 'Left Sidebar / Profile',
      field: 'Preferred Language',
      type: 'String',
      api: 'GET /api/v1/customers/{group}/{custNo}/profile',
      method: 'GET',
      origin: 'Keyloop Core',
      description: 'Customer communication language preference (e.g. English, Arabic)'
    },
    {
      id: 10,
      panel: 'Left Sidebar / Metadata',
      field: 'Customer Since',
      type: 'Date (ISO)',
      api: 'GET /api/v1/customers/{group}/{custNo}/profile',
      method: 'GET',
      origin: 'Keyloop Core',
      description: 'Date customer was first onboarded with AGMC dealership'
    },
    {
      id: 11,
      panel: 'Left Sidebar / Metadata',
      field: 'Last Updated',
      type: 'Date (ISO)',
      api: 'GET /api/v1/customers/{group}/{custNo}/profile',
      method: 'GET',
      origin: 'Keyloop Core',
      description: 'Timestamp of last modification in Keyloop DMS'
    },
    {
      id: 12,
      panel: 'Left Sidebar / Metadata',
      field: 'Nationality & DOB',
      type: 'String / Date',
      api: 'GET /api/v1/customers/{group}/{custNo}/profile',
      method: 'GET',
      origin: 'Keyloop Core',
      description: 'Country of nationality and date of birth'
    },
    {
      id: 13,
      panel: 'Left Sidebar / Metadata',
      field: 'Preferred Branch',
      type: 'String (Code)',
      api: 'GET /api/v1/customers/{group}/{custNo}/profile',
      method: 'GET',
      origin: 'Keyloop Core',
      description: 'Mapped branch name (e.g. 10 - Sheikh Zayed Road, 20 - Sharjah, 30 - Abu Dhabi)'
    },
    {
      id: 14,
      panel: 'Left Sidebar / Metadata',
      field: 'Do Not Contact',
      type: 'Boolean',
      api: 'GET /api/v1/customers/{group}/{custNo}/profile',
      method: 'GET',
      origin: 'Keyloop Core',
      description: 'DNC regulatory flag. Green "No" or Red "Yes"'
    },
    {
      id: 15,
      panel: 'Left Sidebar / Metadata',
      field: 'Communication Consents',
      type: 'Object',
      api: 'GET /api/v1/customers/{group}/{custNo}/profile',
      method: 'GET',
      origin: 'Keyloop Core',
      description: 'Consent channels granted: Email, Phone, SMS, WhatsApp'
    },
    {
      id: 16,
      panel: 'Left Sidebar / Card',
      field: 'Identity Verification Status',
      type: 'Object',
      api: 'GET /api/v1/customers/{group}/{custNo}/verification',
      method: 'GET',
      origin: 'Desktop System',
      description: 'Shows status (VERIFIED / PENDING), verifiedBy staff, lastVerifiedOn date. Rendered strictly if present.'
    },
    {
      id: 17,
      panel: 'Left Sidebar / Card',
      field: 'Risk Overview',
      type: 'Object',
      api: 'GET /api/v1/customers/{group}/{custNo}/risk-overview',
      method: 'GET',
      origin: 'Desktop System',
      description: 'Customer churn/complaint risk level (LOW / MEDIUM / HIGH / CRITICAL), risk score, repeat complaint frequency'
    },
    {
      id: 18,
      panel: 'Vehicle Card / Header',
      field: 'Customer Vehicle List',
      type: 'Array of Vehicles',
      api: 'GET /api/v1/vehicles?group={group}&customerNumber={custNo}',
      method: 'GET',
      origin: 'Keyloop Core',
      description: 'All vehicles owned or leased by customer under this Keyloop account'
    },
    {
      id: 19,
      panel: 'Vehicle Card / Header',
      field: 'Single Vehicle Full Details',
      type: 'Object',
      api: 'GET /api/v1/vehicles/{group}/{vin}',
      method: 'GET',
      origin: 'Keyloop Core',
      description: 'Chassis number (VIN), description, model code, colour, odometer mileage, delivery date, stock progress'
    },
    {
      id: 20,
      panel: 'Vehicle Card / Header',
      field: 'Vehicle Warranty Contract',
      type: 'Object',
      api: 'GET /api/v1/vehicles/{group}/{vin}/warranty',
      method: 'GET',
      origin: 'Keyloop Core',
      description: 'Warranty status (ACTIVE / EXPIRED), contract type, expiry date, provider'
    },
    {
      id: 21,
      panel: 'Vehicle Card / Header',
      field: 'Service Inclusive Contract',
      type: 'Object',
      api: 'GET /api/v1/vehicles/{group}/{vin}/service-contract',
      method: 'GET',
      origin: 'Keyloop Core',
      description: 'Package status (ACTIVE / EXPIRED), contract type (SERVICEINCL), expiration date'
    },
    {
      id: 22,
      panel: 'Right Sidebar / Timeline',
      field: 'Complaint Activity Timeline',
      type: 'Array of Events',
      api: 'GET /api/v1/customers/{group}/{custNo}/complaints?limit=50',
      method: 'GET',
      origin: 'Keyloop & Desktop',
      description: 'Historical complaints event log with date, priority filter, origin filter (DESKTOP vs KEYLOOP)'
    }
  ];

  profileMappingData.forEach((p, idx) => {
    const row = sheet3.addRow(p);
    row.height = 24;
    const isEven = idx % 2 === 0;
    row.eachCell((cell, colNum) => {
      cell.border = borderAll;
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: isEven ? { argb: WHITE } : { argb: BLUE_TINT } };
      cell.font = { name: 'Calibri', size: 9 };
      cell.alignment = { vertical: 'middle', wrapText: true };
      if (colNum === 1 || colNum === 6) cell.alignment = { vertical: 'middle', horizontal: 'center' };
      if (colNum === 6) {
        cell.font = { name: 'Calibri', size: 9, bold: true };
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: METHOD_GET } };
      }
      if (colNum === 3) cell.font = { name: 'Calibri', size: 9, bold: true };
    });
  });

  // ==========================================
  // SHEET 4: API MASTER CATALOG
  // ==========================================
  const sheet4 = workbook.addWorksheet('API Master Catalog', {
    views: [{ showGridLines: true }]
  });

  sheet4.columns = [
    { header: 'API ID', key: 'apiId', width: 8 },
    { header: 'Module', key: 'module', width: 18 },
    { header: 'Submenu / Screen', key: 'screen', width: 22 },
    { header: 'Method', key: 'method', width: 9 },
    { header: 'API Endpoint Pattern', key: 'endpoint', width: 48 },
    { header: 'Parameters / Payload', key: 'params', width: 34 },
    { header: 'Origin System', key: 'origin', width: 14 },
    { header: 'Functional Purpose & Business Logic', key: 'purpose', width: 50 }
  ];

  sheet4.getRow(1).height = 30;
  sheet4.getRow(1).eachCell(cell => {
    cell.style = headerStyle;
  });

  const apiMasterData = [
    // CUSTOMER APIS
    {
      apiId: 'API-01',
      module: 'Customer Profile',
      screen: 'Global Search',
      method: 'GET',
      endpoint: '/api/v1/customers?group={group}&mobile={mobile}',
      params: 'group=BMW, mobile=971501234567',
      origin: 'Keyloop Core',
      purpose: 'Caller ID lookup: Finds customer records by mobile number across all registered phones in DMS'
    },
    {
      apiId: 'API-02',
      module: 'Customer Profile',
      screen: 'Global Search',
      method: 'GET',
      endpoint: '/api/v1/customers?group={group}&customerNumber={custNo}',
      params: 'group=BMW, customerNumber=378171',
      origin: 'Keyloop Core',
      purpose: 'Direct customer lookup by unique Keyloop customer reference ID'
    },
    {
      apiId: 'API-03',
      module: 'Customer Profile',
      screen: 'Left Sidebar',
      method: 'GET',
      endpoint: '/api/v1/customers/{group}/{customerNumber}/profile',
      params: 'Path: group, customerNumber',
      origin: 'Keyloop Core',
      purpose: 'Complete Customer 360 profile (Name, address, contact, loyalty, consents, DNC)'
    },
    {
      apiId: 'API-04',
      module: 'Customer Profile',
      screen: 'Left Sidebar',
      method: 'GET',
      endpoint: '/api/v1/customers/{group}/{customerNumber}/verification',
      params: 'Path: group, customerNumber',
      origin: 'Desktop System',
      purpose: 'Customer identity verification audit: status, verifier staff name, verified date'
    },
    {
      apiId: 'API-05',
      module: 'Customer Profile',
      screen: 'Left Sidebar',
      method: 'GET',
      endpoint: '/api/v1/customers/{group}/{customerNumber}/risk-overview',
      params: 'Path: group, customerNumber',
      origin: 'Desktop System',
      purpose: 'Customer churn/sentiment risk metrics, risk score, repeat complaints count'
    },
    // VEHICLE APIS
    {
      apiId: 'API-06',
      module: 'Customer Profile',
      screen: 'Vehicle Card',
      method: 'GET',
      endpoint: '/api/v1/vehicles?group={group}&customerNumber={custNo}',
      params: 'group=BMW, customerNumber=378171',
      origin: 'Keyloop Core',
      purpose: 'Retrieves all vehicles registered to customer across ownership history'
    },
    {
      apiId: 'API-07',
      module: 'Customer Profile',
      screen: 'Vehicle Card',
      method: 'GET',
      endpoint: '/api/v1/vehicles/{group}/{vin}',
      params: 'Path: group, vin',
      origin: 'Keyloop Core',
      purpose: 'Full vehicle technical specifications, colour, model code, odometer, registration'
    },
    {
      apiId: 'API-08',
      module: 'Customer Profile',
      screen: 'Vehicle Card',
      method: 'GET',
      endpoint: '/api/v1/vehicles/{group}/{vin}/warranty',
      params: 'Path: group, vin',
      origin: 'Keyloop Core',
      purpose: 'Vehicle warranty coverage status, provider contract code, expiration date'
    },
    {
      apiId: 'API-09',
      module: 'Customer Profile',
      screen: 'Vehicle Card',
      method: 'GET',
      endpoint: '/api/v1/vehicles/{group}/{vin}/service-contract',
      params: 'Path: group, vin',
      origin: 'Keyloop Core',
      purpose: 'Active BMW Service Inclusive or maintenance package details and expiry'
    },
    // COMPLAINTS APIS
    {
      apiId: 'API-10',
      module: 'Complaints',
      screen: 'Overview / Open List',
      method: 'GET',
      endpoint: '/api/v1/complaints?group={group}&customerNumber={custNo}&status={status}',
      params: 'group, customerNumber, status=open|all',
      origin: 'Keyloop & Desktop',
      purpose: 'Customer complaints list across both Keyloop core and Desktop origins'
    },
    {
      apiId: 'API-11',
      module: 'Complaints',
      screen: 'Create Complaint',
      method: 'POST',
      endpoint: '/api/v1/complaints',
      params: 'JSON: { keyloopGroup, customerNumber, category, description, branch, priority, createdBy }',
      origin: 'Desktop System',
      purpose: 'Lodges new complaint ticket in desktop system. Generates unique AGMC-<id>'
    },
    {
      apiId: 'API-12',
      module: 'Complaints',
      screen: 'Recovery Actions',
      method: 'GET',
      endpoint: '/api/v1/complaints/{group}/{complaintId}/recovery-actions',
      params: 'Path: group, complaintId',
      origin: 'Desktop System',
      purpose: 'Retrieves active recovery action (gift, loaner car, discount) logged for ticket'
    },
    {
      apiId: 'API-13',
      module: 'Complaints',
      screen: 'Recovery Actions',
      method: 'POST',
      endpoint: '/api/v1/complaints/{group}/{complaintId}/recovery-actions',
      params: 'JSON: { actionType, description, status, assignedTo, valueAed }',
      origin: 'Desktop System',
      purpose: 'Creates a customer recovery action to de-escalate complaint'
    },
    {
      apiId: 'API-14',
      module: 'Complaints',
      screen: 'Recovery Actions',
      method: 'PUT',
      endpoint: '/api/v1/complaints/{group}/{complaintId}/recovery-actions/{actionId}',
      params: 'JSON: { actionType, description, status, assignedTo, valueAed }',
      origin: 'Desktop System',
      purpose: 'Updates status (COMPLETED, IN_PROGRESS) or details of existing recovery action'
    },
    {
      apiId: 'API-15',
      module: 'Complaints',
      screen: 'Recovery Actions',
      method: 'DELETE',
      endpoint: '/api/v1/complaints/{group}/{complaintId}/recovery-actions/{actionId}',
      params: 'Path: group, complaintId, actionId',
      origin: 'Desktop System',
      purpose: 'Cancels / removes a recovery action against a specific complaint'
    },
    {
      apiId: 'API-16',
      module: 'Complaints',
      screen: 'Assign Complaint',
      method: 'GET',
      endpoint: '/api/v1/complaints/{group}/{complaintId}/assignment',
      params: 'Path: group, complaintId',
      origin: 'Keyloop & Desktop',
      purpose: 'Checks assignment status (ASSIGNED vs UNASSIGNED), assigned team/agent, ticket origin'
    },
    {
      apiId: 'API-17',
      module: 'Complaints',
      screen: 'Assign Complaint',
      method: 'PUT',
      endpoint: '/api/v1/complaints/{group}/{complaintId}/assignment',
      params: 'JSON: { teamAgentId: "T-7", assignedTo: "Service Quality Team" } (send empty to unassign)',
      origin: 'Desktop System',
      purpose: 'Allocates complaint ticket to team or agent; 409 for read-only Keyloop tickets'
    },
    {
      apiId: 'API-18',
      module: 'Complaints',
      screen: 'Resolve Complaint',
      method: 'GET',
      endpoint: '/api/v1/complaints/{group}/{complaintId}/resolution',
      params: 'Path: group, complaintId',
      origin: 'Keyloop & Desktop',
      purpose: 'Fetches resolution state (OPEN vs RESOLVED), closure code, notes, and timestamp'
    },
    {
      apiId: 'API-19',
      module: 'Complaints',
      screen: 'Resolve Complaint',
      method: 'POST',
      endpoint: '/api/v1/complaints/{group}/{complaintId}/resolve',
      params: 'JSON: { resolutionCode: "Apology", resolutionNotes: "Manager apologised" }',
      origin: 'Desktop System',
      purpose: 'Formally resolves complaint ticket with agreed outcome code and notes'
    },
    // SALES APIS
    {
      apiId: 'API-20',
      module: 'Sales Portal',
      screen: 'Overview',
      method: 'GET',
      endpoint: '/api/v1/customers/{group}/{customerNumber}/sales-screen',
      params: 'Path: group, customerNumber',
      origin: 'Keyloop Composite',
      purpose: 'Composite sales dashboard endpoint: profile, vehicles, finance, insurance, trade-in'
    },
    {
      apiId: 'API-21',
      module: 'Sales Portal',
      screen: 'New Lead',
      method: 'POST',
      endpoint: '/api/v1/leads',
      params: 'JSON: { keyloopGroup, customerName, mobile, email, make, model, timeline }',
      origin: 'Desktop System',
      purpose: 'Captures a new prospect lead with vehicle of interest and buying timeline'
    },
    {
      apiId: 'API-22',
      module: 'Sales Portal',
      screen: 'New Lead',
      method: 'GET',
      endpoint: '/api/v1/leads?group={group}&mobile={mobile}',
      params: 'group, mobile',
      origin: 'Desktop System',
      purpose: 'Retrieves existing leads associated with customer mobile'
    },
    {
      apiId: 'API-23',
      module: 'Sales Portal',
      screen: 'Enquiries',
      method: 'GET',
      endpoint: '/api/v1/enquiries?group={group}&mobile={mobile}&make={make}&model={model}',
      params: 'group, mobile, make (opt), model (opt), status=open|won|lost',
      origin: 'Keyloop Core',
      purpose: 'Searches Keyloop enquiries by customer mobile; covers WON, LOST, OPEN outcomes'
    },
    {
      apiId: 'API-24',
      module: 'Sales Portal',
      screen: 'Enquiries',
      method: 'GET',
      endpoint: '/api/v1/enquiries/{group}/{enquiryNumber}',
      params: 'Path: group, enquiryNumber (e.g. 564774)',
      origin: 'Keyloop Core',
      purpose: 'Single enquiry full record: dates, sales exec, order/invoice facts, and enrolled journeys (J01, J03)'
    },
    {
      apiId: 'API-25',
      module: 'Sales Portal',
      screen: 'Test Drive',
      method: 'GET',
      endpoint: '/api/v1/test-drives/available-slots?group={group}&branch={branch}&date={date}&model={model}',
      params: 'group, branch, date, model',
      origin: 'Keyloop & Desktop',
      purpose: 'Real-time available test-drive time slots by showroom branch and car model'
    },
    {
      apiId: 'API-26',
      module: 'Sales Portal',
      screen: 'Test Drive',
      method: 'POST',
      endpoint: '/api/v1/test-drives',
      params: 'JSON: { group, customerNumber, model, branch, slotTime, advisor }',
      origin: 'Desktop System',
      purpose: 'Books customer test-drive slot and reserves demonstration vehicle'
    },
    {
      apiId: 'API-27',
      module: 'Sales Portal',
      screen: 'Vehicle Orders',
      method: 'GET',
      endpoint: '/api/v1/orders/{group}/{enquiryNumber}',
      params: 'Path: group, enquiryNumber',
      origin: 'Keyloop Core',
      purpose: 'Summary of customer vehicle order linked to Keyloop enquiry'
    },
    {
      apiId: 'API-28',
      module: 'Sales Portal',
      screen: 'Vehicle Orders',
      method: 'GET',
      endpoint: '/api/v1/orders/{group}/{enquiryNumber}/production',
      params: 'Path: group, enquiryNumber',
      origin: 'Keyloop Core',
      purpose: 'Vehicle factory production tracking (Body shop, Paint, Assembly, Quality release)'
    },
    {
      apiId: 'API-29',
      module: 'Sales Portal',
      screen: 'Vehicle Orders',
      method: 'GET',
      endpoint: '/api/v1/orders/{group}/{enquiryNumber}/shipment',
      params: 'Path: group, enquiryNumber',
      origin: 'Keyloop Core',
      purpose: 'Vessel shipment & logistics tracking to UAE port and central distribution hub'
    },
    {
      apiId: 'API-30',
      module: 'Sales Portal',
      screen: 'Vehicle Orders',
      method: 'GET',
      endpoint: '/api/v1/orders/{group}/{enquiryNumber}/registration',
      params: 'Path: group, enquiryNumber',
      origin: 'Keyloop Core',
      purpose: 'RTA vehicle registration and plate assignment status'
    },
    {
      apiId: 'API-31',
      module: 'Sales Portal',
      screen: 'Vehicle Orders',
      method: 'GET',
      endpoint: '/api/v1/orders/{group}/{enquiryNumber}/vehicle-ready',
      params: 'Path: group, enquiryNumber',
      origin: 'Keyloop Core',
      purpose: 'Pre-delivery inspection (PDI) completion and customer handover readiness'
    },
    {
      apiId: 'API-32',
      module: 'Sales Portal',
      screen: 'Customer Segments',
      method: 'GET',
      endpoint: '/api/v1/customers/segments?group={group}&customerNumber={custNo}',
      params: 'group, customerNumber',
      origin: 'Desktop System',
      purpose: 'Evaluates customer buying persona, VIP categorization, and upgrade readiness'
    },
    // SERVICE APIS
    {
      apiId: 'API-33',
      module: 'Service & Booking',
      screen: 'Overview',
      method: 'GET',
      endpoint: '/api/v1/vehicles/{group}/{vin}/next-service',
      params: 'Path: group, vin',
      origin: 'Keyloop Core',
      purpose: 'Calculated next service due date and odometer threshold (e.g. 2025-02-20 / 1000 km)'
    },
    {
      apiId: 'API-34',
      module: 'Service & Booking',
      screen: 'Overview',
      method: 'GET',
      endpoint: '/api/v1/vehicles/{group}/{vin}/last-service',
      params: 'Path: group, vin',
      origin: 'Keyloop Core',
      purpose: 'Last completed workshop service date, WIP order number, service remarks'
    },
    {
      apiId: 'API-35',
      module: 'Service & Booking',
      screen: 'Book Service',
      method: 'POST',
      endpoint: '/api/v1/service-bookings',
      params: 'JSON: { keyloopGroup, customerNumber, vin, appointmentDate, serviceType, notes }',
      origin: 'Keyloop Core',
      purpose: 'Generates active workshop booking WIP in Keyloop DMS'
    },
    {
      apiId: 'API-36',
      module: 'Service & Booking',
      screen: 'Book Service',
      method: 'GET',
      endpoint: '/api/v1/vehicles/{group}/{vin}/service-eligibility',
      params: 'Path: group, vin',
      origin: 'Keyloop Core',
      purpose: 'Verifies vehicle eligibility for prepaid service package or warranty claim'
    },
    {
      apiId: 'API-37',
      module: 'Service & Booking',
      screen: 'Book Service',
      method: 'GET',
      endpoint: '/api/v1/service-bookings/{group}/{wipNumber}',
      params: 'Path: group, wipNumber',
      origin: 'Keyloop Core',
      purpose: 'Looks up WIP status, service advisor assigned, work operations, labor hours'
    },
    {
      apiId: 'API-38',
      module: 'Service & Booking',
      screen: 'Service History',
      method: 'GET',
      endpoint: '/api/v1/vehicles/{group}/{vin}/service-history',
      params: 'Path: group, vin',
      origin: 'Keyloop Core',
      purpose: 'Historical workshop jobs, invoices, odometer readings, and service operations'
    },
    {
      apiId: 'API-39',
      module: 'Service & Booking',
      screen: 'Warranty Claims',
      method: 'GET',
      endpoint: '/api/v1/vehicles/{group}/{vin}/warranty-claims',
      params: 'Path: group, vin',
      origin: 'Keyloop Core',
      purpose: 'Historical warranty claims filed with manufacturer: status, parts, amounts'
    },
    // FEEDBACK APIS
    {
      apiId: 'API-40',
      module: 'Feedback & CSAT',
      screen: 'CSI / NPS',
      method: 'GET',
      endpoint: '/api/v1/feedback/csi-score?group={group}&customerNumber={custNo}',
      params: 'group, customerNumber',
      origin: 'Keyloop Core',
      purpose: 'Retrieves actual customer CSI score. Only displayed when returned by API (no dummy values)'
    },
    {
      apiId: 'API-41',
      module: 'Feedback & CSAT',
      screen: 'Lost Sales Analysis',
      method: 'GET',
      endpoint: '/api/v1/lost-sales/reasons?group={group}&branch={branch}',
      params: 'group, branch',
      origin: 'Keyloop Core',
      purpose: 'Reasons for lost sales (e.g. Price, Model unavailable, Customer bought elsewhere)'
    },
    // TRACKER API
    {
      apiId: 'API-42',
      module: 'IMEI Tracker',
      screen: 'Live GPS Tracking',
      method: 'POST',
      endpoint: 'http://localhost:3001/api/devices/track',
      params: 'JSON: { imei: "123456789012345" } (15 digits)',
      origin: 'Local Telematics Service',
      purpose: 'Live device ping: returns GPS latitude/longitude, battery %, address, online state'
    }
  ];

  apiMasterData.forEach((a, idx) => {
    const row = sheet4.addRow(a);
    row.height = 24;
    const isEven = idx % 2 === 0;
    row.eachCell((cell, colNum) => {
      cell.border = borderAll;
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: isEven ? { argb: WHITE } : { argb: BLUE_TINT } };
      cell.font = { name: 'Calibri', size: 9 };
      cell.alignment = { vertical: 'middle', wrapText: true };

      if (colNum === 1 || colNum === 4 || colNum === 7) {
        cell.alignment = { vertical: 'middle', horizontal: 'center' };
      }
      if (colNum === 1) cell.font = { name: 'Calibri', size: 9, bold: true };
      if (colNum === 4) {
        cell.font = { name: 'Calibri', size: 9, bold: true };
        let methodColor = METHOD_GET;
        if (cell.value === 'POST') methodColor = METHOD_POST;
        if (cell.value === 'PUT') methodColor = METHOD_PUT;
        if (cell.value === 'DELETE') methodColor = METHOD_DELETE;
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: methodColor } };
      }
      if (colNum === 5) cell.font = { name: 'Consolas', size: 8.5 };
    });
  });

  // Save Workbook to File
  const exportPath = path.resolve('AGMC_Portal_Screens_Menus_and_APIs_Documentation.xlsx');
  await workbook.xlsx.writeFile(exportPath);
  console.log(`Excel generated successfully at: ${exportPath}`);
}

generateDocumentation().catch(err => {
  console.error('Error generating documentation:', err);
  process.exit(1);
});
