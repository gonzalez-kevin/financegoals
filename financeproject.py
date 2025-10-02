# Loading Data
import pandas as pd
import gspread
from oauth2client.service_account import ServiceAccountCredentials
from datetime import datetime, timedelta
import json

# define scope
scope = ["https://spreadsheets.google.com/feeds", "https://www.googleapis.com/auth/drive"]

# load credentials
creds = ServiceAccountCredentials.from_json_keyfile_name("serviceaccountdetails.json", scope)
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
chars_to_remove = ['$', ',']
today = datetime.today()
date_format = '%m/%d/%Y'

investments_goal = 100000
investments_target_date = datetime.strptime('12/31/2027', date_format)
investments_date_diff = investments_target_date - today
investments_days_left = investments_date_diff.days

savings_goal = 15000
savings_target_date = datetime.strptime('12/31/2025', date_format)
savings_date_diff = savings_target_date - today
savings_days_left = savings_date_diff.days


# Cleaning investments df
# convert 'As Of Date' to datetime
investments['As Of Date'] = pd.to_datetime(investments['As Of Date'])

# convert 'Balance' to numeric
for char in chars_to_remove:
    investments['Balance'] = investments['Balance'].str.replace(char, '')
investments['Balance'] = pd.to_numeric(investments['Balance'])
investments_latest_balance = investments['Balance'].iloc[-1]

# Cleaning savings df
# convert 'As Of Date' to datetime
savings['As Of Date'] = pd.to_datetime(savings['As Of Date'])


# convert 'Balance' to numeric
for char in chars_to_remove:
    savings['Balance'] = savings['Balance'].str.replace(char, '')
savings['Balance'] = pd.to_numeric(savings['Balance'])
savings_latest_balance = savings['Balance'].iloc[-1]

# Create a dictionary of the variables you want to expose to JS
data_to_export = {
    "investments": {
        "latest_balance": investments_latest_balance,
        "goal": investments_goal,
        "days_left": investments_days_left,
        "target_date": investments_target_date.strftime('%Y-%m-%d')
    },
    "savings": {
        "latest_balance": savings_latest_balance,
        "goal": savings_goal,
        "days_left": savings_days_left,
        "target_date": savings_target_date.strftime('%Y-%m-%d')
    }
}

# Write dictionary to a JSON file
with open("data.json", "w") as json_file:
    json.dump(data_to_export, json_file, indent=4)
