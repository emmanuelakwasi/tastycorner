# How to Make Personal Changes to Employee Schedules

There are several ways to update employee schedules in the database:

## Method 1: Using the Python Script (Recommended)

Run the interactive script:
```bash
python update_schedule.py
```

This will:
- Show all employees
- Let you select an employee
- Show current schedule
- Allow you to update each day interactively
- Confirm before saving

## Method 2: Direct SQL Updates

### Step 1: Open SQLite
```bash
sqlite3 data/employees.db
```

### Step 2: View Current Schedule
```sql
SELECT employee_id, first_name, last_name, schedule 
FROM employees 
WHERE employee_id = 'YOUR_EMPLOYEE_ID';
```

### Step 3: Update Schedule

#### Option A: Update Entire Schedule (Full JSON)
```sql
UPDATE employees 
SET schedule = '{
  "monday": {"enabled": true, "start": "09:00", "end": "17:00"},
  "tuesday": {"enabled": true, "start": "09:00", "end": "17:00"},
  "wednesday": {"enabled": true, "start": "09:00", "end": "17:00"},
  "thursday": {"enabled": true, "start": "09:00", "end": "17:00"},
  "friday": {"enabled": true, "start": "09:00", "end": "17:00"},
  "saturday": {"enabled": false, "start": "09:00", "end": "17:00"},
  "sunday": {"enabled": false, "start": "09:00", "end": "17:00"}
}'
WHERE employee_id = 'YOUR_EMPLOYEE_ID';
```

#### Option B: Update Specific Day (SQLite 3.38+)
```sql
-- Enable Monday and set times
UPDATE employees
SET schedule = json_set(
    schedule,
    '$.monday.enabled', 1,
    '$.monday.start', '10:00',
    '$.monday.end', '18:00'
)
WHERE employee_id = 'YOUR_EMPLOYEE_ID';
```

#### Option C: Enable/Disable a Day
```sql
-- Enable Monday
UPDATE employees
SET schedule = json_set(schedule, '$.monday.enabled', 1)
WHERE employee_id = 'YOUR_EMPLOYEE_ID';

-- Disable Monday
UPDATE employees
SET schedule = json_set(schedule, '$.monday.enabled', 0)
WHERE employee_id = 'YOUR_EMPLOYEE_ID';
```

#### Option D: Update Time Only
```sql
-- Change Monday start time
UPDATE employees
SET schedule = json_set(schedule, '$.monday.start', '08:00')
WHERE employee_id = 'YOUR_EMPLOYEE_ID';

-- Change Monday end time
UPDATE employees
SET schedule = json_set(schedule, '$.monday.end', '16:00')
WHERE employee_id = 'YOUR_EMPLOYEE_ID';
```

### Step 4: Verify Update
```sql
SELECT 
    employee_id,
    first_name,
    last_name,
    json_extract(schedule, '$.monday.enabled') as monday_enabled,
    json_extract(schedule, '$.monday.start') as monday_start,
    json_extract(schedule, '$.monday.end') as monday_end
FROM employees 
WHERE employee_id = 'YOUR_EMPLOYEE_ID';
```

## Method 3: Using Python Programmatically

```python
import sqlite3
import json

# Connect to database
conn = sqlite3.connect('data/employees.db')
cursor = conn.cursor()

# Define schedule
schedule = {
    'monday': {'enabled': True, 'start': '09:00', 'end': '17:00'},
    'tuesday': {'enabled': True, 'start': '09:00', 'end': '17:00'},
    'wednesday': {'enabled': True, 'start': '09:00', 'end': '17:00'},
    'thursday': {'enabled': True, 'start': '09:00', 'end': '17:00'},
    'friday': {'enabled': True, 'start': '09:00', 'end': '17:00'},
    'saturday': {'enabled': False, 'start': '09:00', 'end': '17:00'},
    'sunday': {'enabled': False, 'start': '09:00', 'end': '17:00'}
}

# Convert to JSON string
schedule_json = json.dumps(schedule)

# Update
cursor.execute(
    "UPDATE employees SET schedule = ? WHERE employee_id = ?",
    (schedule_json, 'YOUR_EMPLOYEE_ID')
)

# Commit changes
conn.commit()
conn.close()
```

## Important Notes

1. **JSON Format**: The schedule must be valid JSON. Use single quotes in SQL, but the JSON itself uses double quotes.

2. **Time Format**: Times must be in 24-hour format: `HH:MM` (e.g., `09:00`, `17:00`, `14:30`)

3. **Boolean Values**: In JSON, use `true`/`false` (lowercase). In SQLite JSON functions, use `1`/`0` for booleans.

4. **Backup First**: Always backup your database before making changes:
   ```bash
   cp data/employees.db data/employees.db.backup
   ```

5. **Verify**: Always verify your changes after updating:
   ```sql
   SELECT employee_id, schedule FROM employees WHERE employee_id = 'YOUR_EMPLOYEE_ID';
   ```

## Quick Reference: Schedule JSON Structure

```json
{
  "monday": {
    "enabled": true,      // true or false
    "start": "09:00",     // 24-hour format: HH:MM
    "end": "17:00"        // 24-hour format: HH:MM
  },
  "tuesday": { ... },
  "wednesday": { ... },
  "thursday": { ... },
  "friday": { ... },
  "saturday": { ... },
  "sunday": { ... }
}
```

## Common Examples

### Example 1: Set Monday-Friday, 9AM-5PM
```sql
UPDATE employees 
SET schedule = '{"monday":{"enabled":true,"start":"09:00","end":"17:00"},"tuesday":{"enabled":true,"start":"09:00","end":"17:00"},"wednesday":{"enabled":true,"start":"09:00","end":"17:00"},"thursday":{"enabled":true,"start":"09:00","end":"17:00"},"friday":{"enabled":true,"start":"09:00","end":"17:00"},"saturday":{"enabled":false,"start":"09:00","end":"17:00"},"sunday":{"enabled":false,"start":"09:00","end":"17:00"}}'
WHERE employee_id = 'YOUR_EMPLOYEE_ID';
```

### Example 2: Set Part-Time (Tue-Thu, 10AM-2PM)
```sql
UPDATE employees 
SET schedule = '{"monday":{"enabled":false,"start":"09:00","end":"17:00"},"tuesday":{"enabled":true,"start":"10:00","end":"14:00"},"wednesday":{"enabled":true,"start":"10:00","end":"14:00"},"thursday":{"enabled":true,"start":"10:00","end":"14:00"},"friday":{"enabled":false,"start":"09:00","end":"17:00"},"saturday":{"enabled":false,"start":"09:00","end":"17:00"},"sunday":{"enabled":false,"start":"09:00","end":"17:00"}}'
WHERE employee_id = 'YOUR_EMPLOYEE_ID';
```

### Example 3: Weekend Only
```sql
UPDATE employees 
SET schedule = '{"monday":{"enabled":false,"start":"09:00","end":"17:00"},"tuesday":{"enabled":false,"start":"09:00","end":"17:00"},"wednesday":{"enabled":false,"start":"09:00","end":"17:00"},"thursday":{"enabled":false,"start":"09:00","end":"17:00"},"friday":{"enabled":false,"start":"09:00","end":"17:00"},"saturday":{"enabled":true,"start":"10:00","end":"16:00"},"sunday":{"enabled":true,"start":"10:00","end":"16:00"}}'
WHERE employee_id = 'YOUR_EMPLOYEE_ID';
```

