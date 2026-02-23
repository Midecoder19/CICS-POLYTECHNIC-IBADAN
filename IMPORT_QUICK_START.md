# Member Import - Quick Setup Guide

## 🚀 **QUICK START**

### 1. Install Dependencies
```bash
cd backend
npm install xlsx
```

### 2. Prepare Excel File
Create `members.xlsx` with these columns:
- **fileno** OR **employeeno** (required)
- **surname** (required)
- **firstname** (required)
- **email** (optional)
- **teleno** (optional)
- **openbal** (optional)
- Other columns as needed

### 3. Run Import
```bash
# Method 1: Direct script execution
node scripts/importMembers.js ./members.xlsx

# Method 2: Using npm script
npm run import-members ./members.xlsx
```

### 4. Verify Results
Check console output for:
- ✅ Successfully imported count
- ⚠️ Duplicates skipped
- ❌ Any errors

## 📋 **EXPECTED OUTPUT**

```
🚀 Starting member import from Excel file...
📊 Found 25 rows in Excel file
✅ Row 2: Member STU2024001 imported successfully
✅ Row 3: Member STU2024002 imported successfully
...
📋 IMPORT SUMMARY
==================
✅ Successfully imported: 25
⚠️  Duplicates skipped: 0
❌ Errors: 0
📊 Total processed: 25
🎉 Import completed!
```

## 🔄 **POST-IMPORT**

Members can now:
1. **Visit signup page** → Select "Sign up as Member"
2. **Enter Member ID** → System validates imported data
3. **Set password** → Via email verification
4. **Access dashboard** → View biodata and ledger

## ✅ **SUCCESS CRITERIA**

- Import runs without errors
- Members appear in database as inactive
- Member signup validates imported IDs
- Dashboard shows imported biodata

---

**Ready to import!** 🎯
