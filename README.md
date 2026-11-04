# NationX Grocery — Engineering Audit & Submission Package

This repository contains the complete technical project report, system architecture diagrams, application screenshots, original engineering specifications, and source code for the **NationX Grocery – Integrated Retail, Wholesale and BulkBuy Commerce Module**.

---

## Directory Structure

```text
NationX_Report/
├── REPORT/
│   ├── NationX_Grocery_Technical_Report.pdf     # Formal 39-page Technical Architecture & Audit Report
│   ├── NationX_Grocery_Technical_Report.docx    # Fully styled Microsoft Word deliverable
│   ├── NationX_Grocery_Technical_Report.md      # Full source Markdown documentation
│   └── NationX_Comprehensive_Report.md         # Summary report
│
├── project_specification/
│   └── NationX_Project_Specification.pdf       # Target specification document
│
├── diagrams/                                   # 17 Architectural Diagrams (C4, ERD, Workflows)
│   ├── System_context.png                      # C4 Model Level 1: System Context
│   ├── container_deployment_architecture.png   # C4 Model Level 2: Containers & Microservices
│   ├── Target_ERD.png                          # Relational Database Entity Relationship Diagram
│   ├── customer_workflow.png                   # Customer discovery and shopping journey
│   ├── Customer Shopping Checkout Flow...png   # 3-step customer checkout state flow
│   ├── merchant_workflow.png                   # Merchant operations & fulfillment workflow
│   ├── Direct_bulk_ordering.png                # BulkBuy Tier A: Direct Tiered Wholesale Flow
│   ├── merchant_quotation_request.png          # BulkBuy Tier B & C: RFQ Negotiation & Assisted Lists
│   ├── cart_checkout_lifecycle.png             # Cart state machine & SLA reservation lifecycle
│   ├── price_vocabulary.png                    # Omnichannel pricing calculation taxonomy
│   ├── Target_evaluation_order.png             # Real-time stock reservation pipeline
│   ├── payment_status.png                      # Distributed payment state machine
│   ├── SHARED_DELIVERY_HANDOFF.png             # Shared delivery fleet handoff integration
│   ├── POS_STOCK_INTEGRATION.png               # Smart POS real-time stock sync
│   ├── KHATA_INTEGRATION.png                   # Khata digital ledger two-phase commit
│   ├── common_orchestration.png                # Event-driven microservices orchestration
│   └── FAILURE_HANDLE_RETRY_DESIGN.png         # Outbox pattern & DLQ failure retry design
│
├── screenshots/                                # 7 Application Verification Screenshots
│   ├── Home.png.png                            # Customer landing page & hero banner
│   ├── Browse.png (2).png                      # Grocery catalog & category filters
│   ├── stores.png.png                          # Geo-fenced store directory
│   ├── Compare_shops.png.png                   # Side-by-side multi-store comparison matrix
│   ├── basket_checkout.png                     # Shopping cart drawer & 3-step checkout modal
│   ├── orders.png.png                          # Live milestone order tracking timeline
│   └── merchant.png.png                        # Merchant dashboard, catalog & inventory
│
└── source_code/
    └── NationX_Grocery/                        # Production React 19 / TypeScript / Vite source code
```

---

## Implementation Status Summary

All features and system components are categorized according to strict engineering verification standards:
- **`[IMPLEMENTED]`**: Verified in the live React 19 source code (8 client routes, 3 React Contexts, 3 BulkBuy workflows, dynamic pricing, merchant management tables).
- **`[PARTIALLY IMPLEMENTED]`**: Client-side UI and state simulations exist (checkout modal with address/delivery slot/payment method, simulated order milestone tracking, local mock database).
- **`[PROPOSED]`**: Target microservices architecture, event-driven orchestration (Kafka / EventMesh), Khata 2PC, Smart POS sync, and 3PL Shared Delivery.
- **`[DECISION REQUIRED]`**: Platform decisions pending stakeholder sign-off (e.g., maximum SLA reservation timeout, WhatsApp assisted order billing policy).

---

## Technical Stack

- **Frontend**: React 19, TypeScript 5.7, Vite 8, Tailwind CSS, Lucide Icons
- **State Management**: React Context (`CartContext`, `LocationContext`, `StoreContext`)
- **Document Tooling**: Node.js, `pdfkit`, `docx`

