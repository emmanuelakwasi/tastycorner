# Order Status Workflow Guide

## 📋 Order Status Flow

### Current Workflow:

1. **Customer Places Order** 
   - Status: `pending` (automatic)
   - Location: Admin Dashboard → Orders section
   - Action: Admin needs to review

2. **Admin Changes Status to "Preparing"**
   - When: Kitchen starts preparing the order
   - Admin Action: Go to Orders → Select order → Change status dropdown → Select "Preparing" → Click "Update"
   - Result: Order is being prepared

3. **Admin Changes Status to "Out For Delivery"** ⭐
   - When: Order is ready and needs to be delivered
   - Admin Action: Go to Orders → Select order → Change status dropdown → Select "Out For Delivery" → Click "Update"
   - Result: **Order now appears in Driver Dashboard!**

4. **Driver Completes Delivery**
   - When: Driver delivers the order
   - Driver Action: Mark delivery as complete in route optimizer
   - Result: Status automatically changes to "completed"

## 🎯 Key Point

**Orders only become visible to delivery drivers when admin changes the status to "out_for_delivery"**

## 📍 Where to Change Status

1. Login to Admin Dashboard: `/admin`
2. Go to "Orders" section (sidebar)
3. Find the order you want to update
4. Use the status dropdown in the order card
5. Select "Out For Delivery"
6. Click "Update" button

## Status Options

- **Pending** - Order just placed, waiting for admin action
- **Preparing** - Kitchen is working on the order
- **Out For Delivery** - Ready for driver pickup ⭐ (Drivers see this)
- **Completed** - Delivered successfully
- **Cancelled** - Order was cancelled

## Quick Reference

| Status | Who Sees It | What It Means |
|--------|-------------|---------------|
| `pending` | Admin only | New order, needs review |
| `preparing` | Admin only | Kitchen is working on it |
| `out_for_delivery` | **Admin + Drivers** | Ready for delivery |
| `completed` | Admin + Customer | Successfully delivered |
| `cancelled` | Admin + Customer | Order was cancelled |

