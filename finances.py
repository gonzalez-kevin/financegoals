# Loading Data
import pandas as pd
import gspread
from oauth2client.service_account import ServiceAccountCredentials
from datetime import datetime, timedelta
import json
import os

# Load JSON from environment variable
json_content = os.environ.get("SERVICE_ACCOUNT_JSON")
if not json_content:
    raise ValueError("SERVICE_ACCOUNT_JSON not found in environment")

service_account_info = json.loads(json_content)

# Define scope
scope = ["https://spreadsheets.google.com/feeds","https://www.googleapis.com/auth/drive"]

# Load credentials directly from dict
creds = ServiceAccountCredentials.from_json_keyfile_dict(service_account_info, scope)
client = gspread.authorize(creds)

# open spreadsheet
spreadsheet = client.open("Financial Goal Tracker")

# creating investments df
investment_sheet = spreadsheet.worksheet("Investments")
investment_data = investment_sheet.get_all_records()
investments = pd.DataFrame(investment_data)

# creating savings df
savings_sheet = spreadsheet.worksheet("Savings")
savings_data = savings_sheet.get_all_records()
savings = pd.DataFrame(savings_data)

# Constants
chars_to_remove = ["$", ","]
today = datetime.today()
date_format = "%m/%d/%Y"

investments_goal = 100000
investments_target_date = datetime.strptime("12/31/2027", date_format)
investments_date_diff = investments_target_date - today
investments_days_left = investments_date_diff.days

savings_goal = 15000
savings_target_date = datetime.strptime("12/31/2025", date_format)
savings_date_diff = savings_target_date - today
savings_days_left = savings_date_diff.days


# Cleaning investments df
# convert "Balance" to numeric
for char in chars_to_remove:
    investments["Balance"] = investments["Balance"].str.replace(char, "")
investments["Balance"] = pd.to_numeric(investments["Balance"])
investments_latest_balance = investments["Balance"].iloc[-1]

# Cleaning savings df
# convert "Balance" to numeric
for char in chars_to_remove:
    savings["Balance"] = savings["Balance"].str.replace(char, "")
savings["Balance"] = pd.to_numeric(savings["Balance"])
savings_latest_balance = savings["Balance"].iloc[-1]

# Create a dictionary of the variables you want to expose to JS
metrics_data = {
    "investments": {
        "latest_balance": investments_latest_balance,
        "goal": investments_goal,
        "days_left": investments_days_left,
        "target_date": investments_target_date.strftime("%Y-%m-%d")
    },
    "savings": {
        "latest_balance": savings_latest_balance,
        "goal": savings_goal,
        "days_left": savings_days_left,
        "target_date": savings_target_date.strftime("%Y-%m-%d")
    }
}

graph_data = {
    "investments_graph": investments.to_dict(orient = "records"), 
    "savings_graph": savings.to_dict(orient = "records")
}

all_data = {
    "metrics": metrics_data,
    "graphs": graph_data
}

# Write dictionary to a JSON file
with open("data.json", "w") as json_file:
    json.dump(all_data, json_file, indent = 4)