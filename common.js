function getSheetUrl(ss_id, sheet_id) {
    let url = 'https://docs.google.com/spreadsheets/d/';
    url += ss_id;
    url += '#gid=';
    url += sheet_id;
    return url;
}

function getIdFromUrl(url) {
    if (!url)
        return "";

    return url.match(/[-\w]{25,}/);
}


function getSheetById(id, ss) {

    let sheets = ss.getSheets();
    for (let i = 0; i < sheets.length; i++) {
        let sheet = sheets[i];
        if (sheet.getSheetId() == id) return sheet;
    }
    return undefined;
}

function sort_sheets_old(list_of_sheet_ids, ss) {

    let pos = ss.getNumSheets();

    for (let i = 0; i < list_of_sheet_ids.length; i++) {
        ss.setActiveSheet(getSheetById(list_of_sheet_ids[i][1], ss));
        //SpreadsheetApp.flush();
        //Utilities.sleep(100);

        ss.moveActiveSheet(pos);

        // SpreadsheetApp.flush();
        //Utilities.sleep(100);
    }

}

function sort_sheets(list_of_sheet_ids, ss) {

    let sheetsreq = [];

    for (s = 0; s < list_of_sheet_ids.length; s++) {

        let sheet_id = list_of_sheet_ids[s][1];

        sheetsreq.push({
            "updateSheetProperties": {
                "fields": "index",
                "properties": {
                    "sheetId": sheet_id,
                    "index": s
                }
            }
        })
    }

    let req = { "requests": sheetsreq };
    Sheets.Spreadsheets.batchUpdate(req, ss.getId());

}

function find_index_in_2d_array(arr, value, pos) {
    for (var i = 0; i < arr.length; i++) if (arr[i][pos] == value) return i;
}

/* function array_move(arr, old_index, new_index) {
    
    var element = arr[old_index];
    arr.splice(old_index, 1);
    arr.splice(new_index, 0, element);

    return arr;

}; */

function array_move(arr, old_index, new_index) {
    if (new_index >= arr.length) {
        var k = new_index - arr.length + 1;
        while (k--) {
            arr.push(undefined);
        }
    }
    arr.splice(new_index, 0, arr.splice(old_index, 1)[0]);
};

function get_id_from_url(url) {
    if (!url) return "";
    return url.match(/[-\w]{25,}/);
}

function trDate(dt) {

    dt = new Date(dt);
    var month = dt.getMonth() + 1;
    var day = dt.getDate();
    var year = dt.getFullYear();
    if (month < 10) month = '0' + month;
    if (day < 10) day = '0' + day;
    var dateFormatted = year + '-' + month + '-' + day;

    return dateFormatted
}

function checkToOnlyOneRunning(func, id) {

    const BASE_KEY = "running_check_";
    let key = BASE_KEY & id;
    let user_email = Session.getEffectiveUser().getEmail();
    let check = CacheService.getScriptCache().get(key);

    /*     if (check) {
          alertDialog("Скрипт уже запущен пользователем с gmail: " + check);
          return;
        } */

    CacheService.getScriptCache().put(key, user_email);

    func();

    CacheService.getScriptCache().remove(key);

}

function alertDialog(text) {
    SpreadsheetApp.getUi().alert(text);
}
