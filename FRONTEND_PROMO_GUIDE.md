# 🎟️ Frontend Promo Code Management Guide

## 🎯 **Updated Frontend Features**

### **📍 Access the Promo Code Management:**
1. Go to `http://localhost:3003/login`
2. Login with admin credentials
3. Click "Promo Codes" in the navigation
4. You'll see the enhanced promo code management interface

## 🚀 **New Features Added:**

### **1. 🎯 Quick Create Buttons**
- **"Quick: 20% Off"** - Creates `INFLUENCER20` with 20% discount
- **"Quick: $10 Off"** - Creates `SAVE10` with $10 fixed discount
- **One-click creation** with default settings

### **2. 🔄 Sync to Stripe Button**
- **"Sync to Stripe"** - Syncs all promo codes to Stripe
- **Real-time feedback** with success/error messages
- **Automatic integration** with checkout sessions

### **3. 🧪 Test Promo Codes**
- **"Test" button** for each promo code
- **Instant validation** with discount calculation
- **Shows final amount** after discount

### **4. ✏️ Full CRUD Operations**
- **Create** - Full form with influencer information
- **Read** - View all promo codes in table
- **Update** - Edit existing promo codes
- **Delete** - Remove promo codes with confirmation

## 🎯 **How to Use:**

### **Quick Create a Promo Code:**
1. **Click "Quick: 20% Off"** button
2. **Promo code created** automatically
3. **Click "Sync to Stripe"** to make it available in checkout
4. **Test the code** using the "Test" button

### **Create Custom Promo Code:**
1. **Click "Create New Code"** button
2. **Fill out the form**:
   - Code: `MYCODE20`
   - Name: `My Custom 20% Off`
   - Type: Percentage
   - Value: 20
   - Influencer info (optional)
3. **Click "Create Promo Code"**
4. **Sync to Stripe** to activate

### **Test a Promo Code:**
1. **Find the promo code** in the table
2. **Click "Test"** button
3. **See validation result** with discount amount
4. **Verify it works** before using in checkout

### **Sync to Stripe:**
1. **Click "Sync to Stripe"** button
2. **Wait for sync** (shows "Syncing..." status)
3. **See success message** when complete
4. **Promo codes are now available** in Stripe checkout

## 📊 **Promo Code Table Features:**

### **Columns Displayed:**
- **Code** - The promo code (e.g., TEST1)
- **Name** - Display name
- **Type** - Percentage or Fixed Amount
- **Value** - Discount value
- **Uses** - Current usage count
- **Influencer** - Influencer name
- **Status** - Active/Inactive/Expired
- **Actions** - Test/Edit/Delete buttons

### **Action Buttons:**
- **🔵 Test** - Validate the promo code
- **🟠 Edit** - Modify the promo code
- **🔴 Delete** - Remove the promo code

## 🎯 **Common Workflows:**

### **Workflow 1: Create and Test a Promo Code**
1. Click "Quick: 20% Off"
2. Click "Sync to Stripe"
3. Click "Test" on the created code
4. Verify it shows correct discount

### **Workflow 2: Create Influencer Promo Code**
1. Click "Create New Code"
2. Fill out influencer information
3. Set custom discount
4. Create and sync to Stripe

### **Workflow 3: Test Existing Promo Code**
1. Find the promo code in table
2. Click "Test" button
3. Verify validation result
4. Use in checkout if valid

## 🔧 **Troubleshooting:**

### **If Promo Code Shows "Invalid" in Stripe:**
1. **Click "Sync to Stripe"** button
2. **Wait for sync to complete**
3. **Try the promo code again**
4. **Check if it's active** in the table

### **If Test Button Shows Error:**
1. **Check if backend is running**
2. **Verify promo code exists** in database
3. **Check network connection**
4. **Try refreshing the page**

### **If Quick Create Fails:**
1. **Check if code already exists**
2. **Try a different code name**
3. **Verify admin permissions**
4. **Check backend logs**

## 🎉 **Success Indicators:**

### **✅ Promo Code Created Successfully:**
- Shows in the table
- Status is "active"
- Can be tested
- Syncs to Stripe

### **✅ Stripe Integration Working:**
- "Sync to Stripe" shows success
- Promo code works in checkout
- Discount applied correctly
- No "invalid" errors

### **✅ Test Validation Working:**
- Test button shows correct discount
- Final amount calculated properly
- No validation errors
- Ready for checkout use

## 🚀 **Next Steps:**

1. **Create your first promo code** using quick create
2. **Sync it to Stripe** to make it available
3. **Test it** to verify it works
4. **Use in checkout** to complete the flow
5. **Create more codes** for different influencers

**Your frontend promo code management is now fully functional!** 🎉
