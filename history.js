function get_client_name_client_id_obj_data() {

    let orders_data_from_db = DATABASE.getData(`idcar/suplRequests/`);
    let obj = {};
    
    for (let order_num in orders_data_from_db){

        if (!orders_data_from_db[order_num]) continue;
        
        let suplRequest = orders_data_from_db[order_num]["suplRequest"];
        let company_name = suplRequest.companyName;
        if (!company_name) continue;
        let company_id = suplRequest.companyID;
        if (!company_id) continue;

        company_name = String(company_name);
        company_name = company_name.replace(/[^a-zA-Zа-яА-Я0-9]+/g , '');
        company_name = company_name.toUpperCase()

        obj[company_name] = company_id; 

    }

    return obj;
    
}

function get_obj_with_order_numbers() {

    let orders_sheet_data = ORDERS_SHEET.getRange(
        ORDERS_ROW_WITH_ABBR,
        ORDERS_FIRST_COL_WITH_DATA,
        ORDERS_SHEET.getLastRow() - ORDERS_ROW_WITH_ABBR + 1,
        ORDERS_SHEET.getLastColumn() - ORDERS_FIRST_COL_WITH_DATA + 1
    ).getValues();

    let obj = {};

    let arr_num_approvedProposals_id;
    let arr_num_suplRequest_id;

    for (let n = 0 ; n < orders_sheet_data[0].length ; n++){
        let data_type = orders_sheet_data[0][n];
        if (data_type == "approvedProposals_id") arr_num_approvedProposals_id = n;
        if (data_type == "suplRequest_id") arr_num_suplRequest_id = n;
    }

    for (let i = 1 ; i < orders_sheet_data.length ; i++){

        let approvedProposals_id = orders_sheet_data[i][arr_num_approvedProposals_id];
        if (!approvedProposals_id) continue;

        let suplRequest_id = orders_sheet_data[i][arr_num_suplRequest_id];

        obj[approvedProposals_id] = suplRequest_id;

    }

    return obj;
    
}

function get_cars_data_in_obj() {

    let orders_data_from_db = DATABASE.getData(`idcar/suplRequests/`);
    let obj = {};
    
    for (let order_num in orders_data_from_db){
        let obj_with_car_data
        try {
            obj_with_car_data = orders_data_from_db[order_num]["car"];
        } catch (e) {continue}

        if (!obj_with_car_data) continue;
        let car_id = orders_data_from_db[order_num]["car"]["id"];
        obj[car_id] = obj_with_car_data;
    }

    return obj;
    
}

function get_clients_data_in_obj() {

    let obj_with_orders_numbers = get_obj_with_order_numbers();
    let clients_data_from_db = get_client_name_client_id_obj_data();

    let orders_data_from_db = DATABASE.getData(`idcar/suplRequests/`);
    let acc_sheet_data = SHEET.getRange(
        ROW_WITH_ABBR,
        FIRST_COL_WITH_DATA,
        SHEET.getLastRow() - ROW_WITH_ABBR + 1,
        SHEET.getLastColumn() - FIRST_COL_WITH_DATA + 1
    ).getValues();

    let arr_num_approvedProposals_id = acc_sheet_data[0].indexOf("approvedProposals_id");
    let arr_num_suplRequest_companyName = acc_sheet_data[0].indexOf("suplRequest_companyName");
    let arr_num_return = acc_sheet_data[0].indexOf("acc_return");
    let arr_num_claim = acc_sheet_data[0].indexOf("acc_claim");
    //для проверки на заполненность строки
    let arr_num_acc_price_vat = acc_sheet_data[0].indexOf("acc_price_vat");
    let arr_num_acc_sum_vat = acc_sheet_data[0].indexOf("acc_sum_vat");
    let arr_num_acc_markup_fact = acc_sheet_data[0].indexOf("acc_markup_fact");
    let arr_num_acc_markup_plan_sum = acc_sheet_data[0].indexOf("acc_markup_plan_sum");
    let arr_num_acc_markup_fact_sum = acc_sheet_data[0].indexOf("acc_markup_fact_sum");

    let obj = {};

    for (let i = 1 ; i < acc_sheet_data.length ; i++){

        if (!acc_sheet_data[i][arr_num_return] &&
            (!acc_sheet_data[i][arr_num_acc_price_vat]||
            !acc_sheet_data[i][arr_num_acc_sum_vat]||
            !acc_sheet_data[i][arr_num_acc_markup_fact]||
            !acc_sheet_data[i][arr_num_acc_markup_plan_sum]||
            !acc_sheet_data[i][arr_num_acc_markup_fact_sum])
        ) continue;
        let approvedProposals_id = acc_sheet_data[i][arr_num_approvedProposals_id];
        let client_id;
        let car_id;
        let suplRequest_id = null;
        if (approvedProposals_id && approvedProposals_id != "-"){
            suplRequest_id = obj_with_orders_numbers[approvedProposals_id];
            if (!suplRequest_id) continue;
            client_id = orders_data_from_db[suplRequest_id]["suplRequest"]["companyID"];
            try {
                car_id = orders_data_from_db[suplRequest_id]["car"]["id"];
            } catch (e) {}
        }
        else{
            let company_name = acc_sheet_data[i][arr_num_suplRequest_companyName];
            if (!company_name) continue;
            company_name = company_name.replace(/[^a-zA-Zа-яА-Я0-9]+/g , '');
            company_name = company_name.toUpperCase()
            client_id = clients_data_from_db[company_name];
            car_id = "no_car";
        }

        if (!client_id) continue;        
        if (client_id == 76) continue; //ID клиента АЙДИКАР
        if (!car_id) car_id = "no_car";

        let isReturn;
        if (acc_sheet_data[i][arr_num_return] == "") isReturn = false;
        else isReturn = true;

        let isClaim;
        if (acc_sheet_data[i][arr_num_claim] == "") isClaim = false;
        else isClaim = true;

        if (!obj[client_id]) obj[client_id] = {};
        if(!obj[client_id]["all_orders"]) obj[client_id]["all_orders"] = {};
        if(!obj[client_id]["all_orders"][i]) obj[client_id]["all_orders"][i] = {};

        if (car_id){
            if (!obj[client_id][car_id]) obj[client_id][car_id] = {};
            if (!obj[client_id][car_id][i]) obj[client_id][car_id][i] = {};
        }

        for (let n = 0 ; n < acc_sheet_data[i].length ; n++){

            let data_type = acc_sheet_data[0][n];
            if (!data_type) continue;
            let value = acc_sheet_data[i][n];
            if (!value) continue;
            if (data_type.includes("date") || data_type == "acc_last_update") value = trDate(value);
            if (typeof value == "number") value = (Math.round(value * 100))/100

            if (car_id) obj[client_id][car_id][i][data_type] = value;

            obj[client_id]["all_orders"][i][data_type] = value;

            if (isReturn) {
                if(!obj[client_id]["returns"]) obj[client_id]["returns"] = {};
                if(!obj[client_id]["returns"][i]) obj[client_id]["returns"][i] = {};
                obj[client_id]["returns"][i][data_type] = value;
                obj[client_id]["returns"][i]["suplRequest_id"] = suplRequest_id;
            }

            if (isClaim) {
                if(!obj[client_id]["claims"]) obj[client_id]["claims"] = {};
                if(!obj[client_id]["claims"][i]) obj[client_id]["claims"][i] = {};
                obj[client_id]["claims"][i][data_type] = value;
                obj[client_id]["claims"][i]["suplRequest_id"] = suplRequest_id;
            }

        }

        if (car_id) obj[client_id][car_id][i]["suplRequest_id"] = suplRequest_id;
        obj[client_id]["all_orders"][i]["suplRequest_id"] = suplRequest_id;

    }

    return obj;
    
}

function fill_the_history_tables() {

    let db = DATABASE.getData("/");
    
    let last_update_history = db.last_update_history;
    //let last_update_history;
    if (!last_update_history) last_update_history = new Date(2000 , 1 , 1)
    let orders_data_from_db = db.idcar.suplRequests;
    let inf_about_clients_ss_from_db = db.history_files;
    if (!inf_about_clients_ss_from_db) inf_about_clients_ss_from_db = {};

    let old_clients_data_in_obj = db.history_of_orders;
    if (!old_clients_data_in_obj) old_clients_data_in_obj = {};

    let clients_data_in_obj = get_clients_data_in_obj();
    let cars_data_in_obj = get_cars_data_in_obj();
    let obj_with_orders_numbers = get_obj_with_order_numbers();

    let history_file_template = DriveApp.getFileById(HISTORY_FILE_TEMPLATE_ID);
    let history_folder = DriveApp.getFolderById(HISTORY_FOLDER_ID);

    for (let client_id in clients_data_in_obj){

        let client_ss_id;
        if (!inf_about_clients_ss_from_db[client_id]) inf_about_clients_ss_from_db[client_id] = {};

        let client_ss_url = inf_about_clients_ss_from_db[client_id]["all_orders"];
        if (client_ss_url) client_ss_id = getIdFromUrl(client_ss_url)
        else{

            let client_name = "";
            
            for (let arr_num in clients_data_in_obj[client_id]["all_orders"]){
                let appr_prop_id = clients_data_in_obj[client_id]["all_orders"][arr_num]["approvedProposals_id"]
                if (!appr_prop_id) continue;
                let supl_req_id = obj_with_orders_numbers[appr_prop_id];
                if (!supl_req_id) continue;
                client_name = orders_data_from_db[supl_req_id]["suplRequest"]["companyName"];
                if (!client_name) continue;
                break;
            }
            let new_client_file =  history_file_template.makeCopy(`История ${client_name}` , history_folder);
            client_ss_id = new_client_file.getId();
            new_client_file.setSharing(DriveApp.Access.ANYONE_WITH_LINK , DriveApp.Permission.VIEW);
            new_client_file.setOwner("kostyan4ek@gmail.com")
            let client_main_sheet_url = getSheetUrl(client_ss_id , "0");
            inf_about_clients_ss_from_db[client_id]["all_orders"] = client_main_sheet_url;
                      
        }

        try {
            if (JSON.stringify(old_clients_data_in_obj[client_id]["all_orders"]) == JSON.stringify(clients_data_in_obj[client_id]["all_orders"])) continue;
        } catch (error) {}


        let last_update_check_main = false;

        for (let arr_num in clients_data_in_obj[client_id]["all_orders"]){

            for (let data_type in clients_data_in_obj[client_id]["all_orders"][arr_num]){

                try {
                    if (clients_data_in_obj[client_id]["all_orders"][arr_num][data_type] != old_clients_data_in_obj[client_id]["all_orders"][arr_num][data_type]) last_update_check_main = true;
                } catch (error) {last_update_check_main = true}

            }
        }

        if (!last_update_check_main) continue;


        let client_ss = SpreadsheetApp.openById(client_ss_id);
        let template_sheet = client_ss.getSheetByName("Шаблон");

        let num_of_new_sheets = 0;

        for (let car_id in clients_data_in_obj[client_id]){

            if (clients_data_in_obj[client_id][car_id] == {} || !clients_data_in_obj[client_id][car_id]) continue; 

            let car_sheet;
            let car_sheet_url = inf_about_clients_ss_from_db[client_id][car_id];
            if (car_sheet_url){
                let car_sheet_id = car_sheet_url.split('#gid=').pop();
                car_sheet = getSheetById(car_sheet_id , client_ss);
            }
            else {

                if (car_id == "all_orders"){
                    car_sheet = client_ss.getSheetByName("Все заказы")
                }else{
                    num_of_new_sheets++;
                    car_sheet = client_ss.insertSheet({"template" : template_sheet});
                    car_sheet.showSheet();
                }

                
                let car_sheet_id = car_sheet.getSheetId();
                inf_about_clients_ss_from_db[client_id][car_id] = getSheetUrl(client_ss_id , car_sheet_id);
            }

            let sheet_name;
    
            if (car_id != "all_orders" && car_id != "returns" && car_id != "claims" && car_id != "no_car"){

                let isTrailer = cars_data_in_obj[car_id]["isTrailer"];
                let title = cars_data_in_obj[car_id]["title"];
                let brand = cars_data_in_obj[car_id]["brand"];
                if (!brand) brand = "";
                let model = cars_data_in_obj[car_id]["model"];
                if (!model) model = "";
                let registration = cars_data_in_obj[car_id]["registration"];
                if (!registration) registration = "";

                if (isTrailer) {
                    sheet_name = `Прицеп ${registration}`
                }
                else {
                    if (title) sheet_name = `${title} ${registration}`
                    else sheet_name = `${brand} ${model} ${registration}`
                }

            }
            else{

                switch (car_id) {

                    case "all_orders":
                        sheet_name = "Все заказы";
                        break;

                    case "no_car":
                        sheet_name = "Без обозначения";
                        break;
                    
                    case "returns":
                        sheet_name = "Возвраты";
                        break;

                    case "claims":
                        sheet_name = "Рекламации";
                        break;
                
                    default:
                        break;
                }
            }

            while (true) {
                try {
                    car_sheet.setName(sheet_name); 
                    break;
                } catch (e) {
                    sheet_name += " ";
                }
            }

            let last_update_check = false;

            for (let arr_num in clients_data_in_obj[client_id][car_id]){
                for (let data_type in clients_data_in_obj[client_id][car_id][arr_num]){
                    try {
                        if (clients_data_in_obj[client_id][car_id][arr_num][data_type] != old_clients_data_in_obj[client_id][car_id][arr_num][data_type]) last_update_check = true;
                    } catch (error) {last_update_check = true}
                }
            }

            if (!last_update_check) continue; 

            let car_sheet_data = car_sheet.getRange(
                ROW_WITH_ABBR,
                FIRST_COL_WITH_DATA,
                1,
                car_sheet.getLastColumn() - FIRST_COL_WITH_DATA + 1
            ).getValues();

            let col_num_suplRequest_id = FIRST_COL_WITH_DATA + car_sheet_data[0].indexOf("suplRequest_id");
            let suplRequest_links = [];

            let current_arr_num = 1;

            for (let arr_num in clients_data_in_obj[client_id][car_id]){

                car_sheet_data.push(new Array(car_sheet_data[0].length));
                suplRequest_links.push(new Array(1));

                let acc_form_pay = clients_data_in_obj[client_id][car_id][arr_num]["acc_form_of_pay"];
                let acc_pay_checkbox_cash = clients_data_in_obj[client_id][car_id][arr_num]["acc_pay_checkbox_cash"];
                let acc_pay_checkbox = clients_data_in_obj[client_id][car_id][arr_num]["acc_pay_checkbox"];
                let acc_pay_checkbox_index_client_ss = car_sheet_data[0].indexOf("acc_pay_checkbox");

                if ((acc_form_pay != 2 && acc_pay_checkbox_cash) ||
                (acc_form_pay == 2 && acc_pay_checkbox)) car_sheet_data[current_arr_num][acc_pay_checkbox_index_client_ss] = "Оплачено";

                for (let data_type in clients_data_in_obj[client_id][car_id][arr_num]){

                    if (data_type == "acc_pay_checkbox") continue;

                    let value = clients_data_in_obj[client_id][car_id][arr_num][data_type];
                    let index =  car_sheet_data[0].indexOf(data_type);
                    if (index == -1) continue
                    if (data_type == "car_isTrailer" && value) value = "Прицеп";
                    // if (data_type == "acc_pay_checkbox" && value) value = "Оплачено";
                    if (data_type == "acc_form_of_pay" && value == 2) value = "Прямая";
                    if (data_type == "acc_form_of_pay" && value != 2) continue;
                    if (data_type == "acc_invoice_num" && !value) value = "Не выписано";
                    car_sheet_data[current_arr_num][index] = value;

                }

                let suplRequest_id = clients_data_in_obj[client_id][car_id][arr_num]["suplRequest_id"];
                if (suplRequest_id){
                    let link = "";
                    try {
                        link = orders_data_from_db[suplRequest_id]["suplRequest"]["link"];
                        if (!link) continue;
                        let formula = `=HYPERLINK("${link}" ; "${suplRequest_id}")`;
                        suplRequest_links[current_arr_num - 1][0] = formula;
                    } catch (e) {
                        suplRequest_links[current_arr_num - 1][0] = `=${suplRequest_id}`;
                    }
                }
                current_arr_num++;
            }

            try {
                car_sheet.getRange(
                    ROW_WITH_ABBR + 1,
                    FIRST_COL_WITH_DATA,
                    car_sheet.getLastRow() - ROW_WITH_ABBR,
                    car_sheet.getLastColumn() - FIRST_COL_WITH_DATA + 1
                ).clearContent();
            } catch (e) {}    

            car_sheet.getRange(
                ROW_WITH_ABBR,
                FIRST_COL_WITH_DATA,
                car_sheet_data.length,
                car_sheet_data[0].length
            ).setValues(car_sheet_data);

            try {
                car_sheet.getRange(
                    ROW_WITH_ABBR + 1,
                    col_num_suplRequest_id,
                    suplRequest_links.length,
                    suplRequest_links[0].length
                ).setFormulas(suplRequest_links);
            } catch (e) {}
        }

        //механизм сортировки листов

        if (num_of_new_sheets == 0) continue;

        let inf_about_current_ss = inf_about_clients_ss_from_db[client_id];
        let arr_with_car_ids_and_sheet_ids = [];

        for (let car_id in inf_about_current_ss){

            let sheet_url = inf_about_current_ss[car_id];
            let sheet_id = sheet_url.split('#gid=').pop();
            arr_with_car_ids_and_sheet_ids.push([car_id , sheet_id]);

        }

        let index_all_orders_data = find_index_in_2d_array(arr_with_car_ids_and_sheet_ids , "all_orders" , 0);
        if (index_all_orders_data) {
            let all_orders_data = arr_with_car_ids_and_sheet_ids[index_all_orders_data];
            arr_with_car_ids_and_sheet_ids.splice(index_all_orders_data , 1);
            arr_with_car_ids_and_sheet_ids.splice(0 , 0 , all_orders_data);
        }

        let index_no_car_data = find_index_in_2d_array(arr_with_car_ids_and_sheet_ids , "no_car" , 0);
        if (index_no_car_data) {
            let no_car_data = arr_with_car_ids_and_sheet_ids[index_no_car_data];
            arr_with_car_ids_and_sheet_ids.splice(index_no_car_data , 1);
            arr_with_car_ids_and_sheet_ids.splice(-1 , 0 , no_car_data);
        }

        let index_returns_data = find_index_in_2d_array(arr_with_car_ids_and_sheet_ids , "returns" , 0);
        if (index_returns_data) {
            let returns_data = arr_with_car_ids_and_sheet_ids[index_returns_data];
            arr_with_car_ids_and_sheet_ids.splice(index_returns_data , 1);
            arr_with_car_ids_and_sheet_ids.splice(-1 , 0 , returns_data);
        }

        let index_claims_data = find_index_in_2d_array(arr_with_car_ids_and_sheet_ids , "claims" , 0);
        if (index_claims_data) {
            let claims_data = arr_with_car_ids_and_sheet_ids[index_claims_data];
            arr_with_car_ids_and_sheet_ids.splice(index_claims_data , 1);
            arr_with_car_ids_and_sheet_ids.splice(-1 , 0 , claims_data);
        }

        for (let i = 0 ; i < arr_with_car_ids_and_sheet_ids.length ; i++){


            let car_id = arr_with_car_ids_and_sheet_ids[i][0];
            if (car_id == "all_orders" || car_id == "returns" || car_id == "claims" || car_id == "no_car") continue;

            let car_data_from_db = cars_data_in_obj[car_id];
            let is_trailer = car_data_from_db.isTrailer;
            if (is_trailer) continue;

            let trailer_IDs = car_data_from_db.trailerIDs;
            if (!trailer_IDs) continue;

            for (let n = 0 ; n < trailer_IDs.length ; n++){

                let trailer_index = find_index_in_2d_array(arr_with_car_ids_and_sheet_ids , trailer_IDs[n] , 0);
                if (!trailer_index) continue;
                let trailer_data = arr_with_car_ids_and_sheet_ids[trailer_index];
                arr_with_car_ids_and_sheet_ids.splice(trailer_index , 1);
                i = find_index_in_2d_array(arr_with_car_ids_and_sheet_ids , car_id , 0);
                arr_with_car_ids_and_sheet_ids.splice(i + 1 , 0 , trailer_data);
                i = find_index_in_2d_array(arr_with_car_ids_and_sheet_ids , car_id , 0);

            }

        }

        sort_sheets(arr_with_car_ids_and_sheet_ids , client_ss);
    
    }

    DATABASE.updateData("/" , {"last_update_history" : new Date()})
    DATABASE.updateData(`history_files/` , inf_about_clients_ss_from_db);
    DATABASE.updateData(`history_of_orders/` , clients_data_in_obj)
    
}

function button_refresh_history_clients() {

    checkToOnlyOneRunning(fill_the_history_tables , "history_update");
    
}