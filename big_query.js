// const {BigQuery} = require('@google-cloud/bigquery');
// const bigquery = new BigQuery();

// Compiled using undefined undefined (TypeScript 4.7.4)
const ORDERS_SHEET_NAME = "Лист";
const DATASET_ID = "id_car_dataset";
const TABLE_ID = "orders_table";
const PROJECT_ID = "bigq-idcar";
const APP_SHEET = "app_sheet";

var OrdersSheet = SpreadsheetApp.getActive().getSheetByName(ORDERS_SHEET_NAME);
var AppSheet = SpreadsheetApp.getActive().getSheetByName(APP_SHEET);

function getColumnById() {
  var columnNum = {};
  if (OrdersSheet != null) {
    var columnCount = OrdersSheet.getMaxColumns();
    var tegRow = OrdersSheet.getRange(2, 1, 1, columnCount).getValues();
    tegRow[0].forEach(function (currName, index) {
      if (currName != "" && currName != "Номер заказа") {
        columnNum[currName] = index;
      }
    });
  }
  return columnNum;
}

function uuidv4() {
  var dt = new Date().getTime();
  var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    var r = (dt + Math.random() * 16) % 16 | 0;
    dt = Math.floor(dt / 16);
    return (c == 'x' ? r : (r & 0x3 | 0x8)).toString(16);
  });
  return uuid;
}

function createQuery(record) {

  Object.keys(record).forEach((key) => {
    if (typeof record[key] === 'string') {
      record[key] = record[key].replace('\n', ' ')
      record[key] = record[key].replace('"', '\\"')
    }
  })

  return `
  INSERT orders_table (
      acc_date
    , acc_seller
    , acc_provider_invoice_num
    , acc_name
    , acc_quantity
    , acc_provider_price_no_vat
    , invoise_checkbox
    , approvedProposals_id
    , suplRequest_createdByName
    , car_title
    , car_registration
    , car_isTrailer
    , suplRequest_companyName
    , acc_return
    , acc_claim
    , acc_pay_checkbox_cash
    , comments
    , rollback
    , acc_invoice_num_cash
    , acc_invoice_num
    , resiver
    , customer_by_docs
    , acc_form_of_pay
    , acc_add_services
    , acc_pay_checkbox
    , acc_markup_plan
    , city
    , unknown_column_6
    , provider
    , full_turnover
    , odessa_turnover
    , trade
    , path_in_full_turnover
    , number
    , unknown_column_1
    , unknown_column_2
    , unknown_column_3
    , unknown_column_4
    , unknown_column_5
    , id
  ) VALUES (
      "${record.acc_date.toISOString().split('T')[0]}"
    , "${record.acc_seller}"
    , "${record.acc_provider_invoice_num}"
    , "${record.acc_name}"
    , ${record.acc_quantity}
    , ${record.acc_provider_price_no_vat}
    , ${record.invoise_checkbox}
    , "${record.approvedProposals_id}"
    , "${record.suplRequest_createdByName}"
    , "${record.car_title}"
    , "${record.car_registration}"
    , ${record.car_isTrailer}
    , "${record.suplRequest_companyName}"
    , "${record.acc_return}"
    , "${record.acc_claim}"
    , ${record.acc_pay_checkbox_cash}
    , "${record.comments}"
    , "${record.rollback}"
    , "${record.acc_invoice_num_cash}"
    , "${record.acc_invoice_num}"
    , "${record.resiver}"
    , "${record.customer_by_docs}"
    , "${record.acc_form_of_pay}"
    , "${record.acc_add_services}"
    , ${record.acc_pay_checkbox}
    , "${record.acc_markup_plan}"
    , "${record.city}"
    , "${record.unknown_column_6}"
    , "${record.provider}"
    , "${record.full_turnover}"
    , "${record.odessa_turnover}"
    , "${record.trade}"
    , "${record.path_in_full_turnover}"
    , "${record.number}"
    , "${record.unknown_column_1}"
    , "${record.unknown_column_2}"
    , "${record.unknown_column_3}"
    , "${record.unknown_column_4}"
    , "${record.unknown_column_5}"
    , "${record.id}"
  );
  `
}

function saveInDB() {
  var columns = getColumnById();
  if (OrdersSheet != null) {
    var rowsCount = OrdersSheet.getMaxRows();
    var columnCount = OrdersSheet.getMaxColumns();
    var data = OrdersSheet.getRange(3, 1, rowsCount - 2, columnCount).getValues();
    data.forEach(function (row, rowNumber) {
      const record = {};
      Object.keys(columns).forEach(function (colId) {
        const index = columns[colId];
        record[colId] = row[index];
      });
      if (record.id === '') {
        record.id = uuidv4();
        sqlQuery = createQuery(record);
        requestSend(sqlQuery);
        OrdersSheet.getRange(rowNumber + 3, columns.id + 1).setValue(record.id);
      }
    });
  }
}

function loadFromDB(dateStart, dateEnd) {
  var columnsByHeadersTable = getColumnById();
  console.log("Loading...");
  // const query = `
  //        SELECT 
  //         *
  //        FROM
  //         id_car_dataset.orders_table
  //        WHERE
  //         acc_date BETWEEN '${dateStart}' AND '${dateEnd}'
  //        ;
  //      `;
  const query = `
         SELECT 
          *
         FROM
          id_car_dataset.orders_table;
       `;

  var queryResults = requestSend(query)

  const jobId = queryResults.jobReference.jobId;

  // Check on status of the Query Job.
  var sleepTimeMs = 1000;
  while (!queryResults.jobComplete) {
    Utilities.sleep(sleepTimeMs);
    queryResults = BigQuery.Jobs.getQueryResults(PROJECT_ID, jobId);
  }

  // Get all the rows of results.
  var rows = queryResults.rows;
  while (queryResults.pageToken) {
    queryResults = BigQuery.Jobs.getQueryResults(PROJECT_ID, jobId, {
      pageToken: queryResults.pageToken
    });
    rows = rows.concat(queryResults.rows);
  }
  console.log(rows);

  if (!rows) {
    Logger.log('No rows returned.');
    return;
  }

  // Append the headers.
  var columnsByHeadersDB = {};
  queryResults.schema.fields.forEach(function (field, fieldNum) {
    columnsByHeadersDB[field.name] = fieldNum;
  });

  // Append the results.
  var data = new Array(rows.length);
  for (let i = 0; i < rows.length; i++) {
    const cols = rows[i].f;
    data[i] = new Array(cols.length);
    for (let j = 0; j < cols.length; j++) {
      data[i][j] = cols[j].v;
    }
  }
  AppSheet.getRange(3, 1, rows.length, headers.length).setValues(data);

}

function requestSend(sqlQuery) {
  const request = {
    query: sqlQuery,
    defaultDataset: {
      'datasetId': DATASET_ID,
      'projectId': PROJECT_ID
    },
    useLegacySql: false
  };
  return BigQuery.Jobs.query(request, PROJECT_ID);
}


// id STRING REQUIRED 		
// acc_date DATE REQUIRED 		
// acc_seller STRING NULLABLE 		
// acc_provider_invoice_num STRING NULLABLE 		
// acc_name STRING NULLABLE 		
// acc_quantity INTEGER NULLABLE 		
// acc_provider_price_no_vat FLOAT NULLABLE 		
// invoise_checkbox BOOLEAN NULLABLE 		
// approvedProposals_id STRING NULLABLE 		
// suplRequest_createdByName STRING NULLABLE 		
// car_title STRING NULLABLE 		
// car_registration STRING NULLABLE 		
// car_isTrailer BOOLEAN NULLABLE 		
// suplRequest_companyName STRING NULLABLE 		
// acc_return STRING NULLABLE 		
// acc_claim STRING NULLABLE 		
// acc_pay_checkbox_cash BOOLEAN NULLABLE 		
// comments STRING NULLABLE 		
// rollback STRING NULLABLE 		
// acc_invoice_num_cash STRING NULLABLE 		
// acc_invoice_num STRING NULLABLE 		
// resiver STRING NULLABLE 		
// customer_by_docs STRING NULLABLE 		
// acc_form_of_pay STRING NULLABLE 		
// acc_add_services STRING NULLABLE 		
// acc_pay_checkbox BOOLEAN NULLABLE 		
// acc_markup_plan STRING NULLABLE 		
// city STRING NULLABLE 		
// unknown_column_6 STRING NULLABLE 		
// provider STRING NULLABLE 		
// full_turnover STRING NULLABLE 		
// odessa_turnover STRING NULLABLE 		
// trade STRING NULLABLE 		
// path_in_full_turnover STRING NULLABLE 		
// number STRING NULLABLE 		
// unknown_column_1 STRING NULLABLE 		
// unknown_column_2 STRING NULLABLE 		
// unknown_column_3 STRING NULLABLE 		
// unknown_column_4 STRING NULLABLE 		
// unknown_column_5 STRING NULLABLE 		


