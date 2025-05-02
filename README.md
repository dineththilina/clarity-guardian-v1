To run the app:

Open a Terminal window and enter “cd [path to clarity-guardian-v1]”
Run “npm install”
Run “npm run dev”
Navigate to the IP address shown in the terminal from your browser.

Once the app’s dashboard loads:

For the Google Sheets URL: Provide https://docs.google.com/spreadsheets/d/1ZMQsHxPu3w3MlsTxLesM5jDiBNhirKO11mzTk-eh6v0/edit?gid=0#gid=0 and click on the Save & Fetch Data button.

The app will fetch and display the data of the last row in the Google Sheet and will update every 30 seconds to display updated data (in subsequent rows of the sheets).

Note: You may provide your own Google Sheets link as long as it contains the necessary data in its columns and is accessible to anyone with the link.

Your Google Sheet must:

Shared and accessible by the application (File > Share > Share with others > Anyone with the link)
Contain the following columns:
index
time (timestamp)
Temperature
Turbidity
Ph
TDS
conductivity (optional)
dissolvedOxygen (optional)

