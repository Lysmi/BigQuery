function button_manual_update_order_data() {

    checkToOnlyOneRunning(manual_update_orders_data, "order_data");
    
}

function manual_update_orders_data() {

    let orders_data_from_sheet = ORDERS_SHEET.getRange(
        ORDERS_ROW_WITH_ABBR,
        ORDERS_FIRST_COL_WITH_DATA,
        ORDERS_SHEET.getLastRow() - ORDERS_ROW_WITH_ABBR + 1,
        ORDERS_SHEET.getLastColumn() - ORDERS_FIRST_COL_WITH_DATA + 1
    ).getValues();

    let transfer_status_col = orders_data_from_sheet[0].indexOf("transfer_status") + 1;

    let orders_data_in_obj = get_orders_data_in_obj(orders_data_from_sheet);

    let acc_sheet_data = SHEET.getRange(
        ROW_WITH_ABBR,
        FIRST_COL_WITH_DATA,
        SHEET.getLastRow() - ROW_WITH_ABBR + 1,
        SHEET.getLastColumn() - FIRST_COL_WITH_DATA + 1
    ).getValues();

    let approvedProposals_id_index = acc_sheet_data[0].indexOf("approvedProposals_id");
    let check_appr_prop_id_index = acc_sheet_data[0].indexOf("check_appr_prop_id");

    for (let i = 1 ; i < acc_sheet_data.length ; i++){

        let new_appr_prop_id = acc_sheet_data[i][approvedProposals_id_index];
        if (new_appr_prop_id == "-") continue; 
        let old_appr_prop_id = acc_sheet_data[i][check_appr_prop_id_index];
        if ((!old_appr_prop_id && !new_appr_prop_id) || (old_appr_prop_id == "" && new_appr_prop_id == "") || old_appr_prop_id == new_appr_prop_id) continue;

        if (old_appr_prop_id){

            for (let n = 0 ; n < acc_sheet_data[0].length ; n++){

                let key = acc_sheet_data[0][n];
                if (key.includes("acc_") || !key || key == "approvedProposals_id") continue;
    
                SHEET.getRange(
                    ROW_WITH_ABBR + i,
                    FIRST_COL_WITH_DATA + n
                ).clearContent();
    
            }
    
            let old_id_transfer_status = orders_data_in_obj?.[old_appr_prop_id]?.["transfer_status"];
            if (old_id_transfer_status != "Не перенесен"){
    
                let row_num = orders_data_in_obj?.[old_appr_prop_id]?.["row_number"];
                if (row_num){

                    let check = true;

                    for (let a = 1 ; a < acc_sheet_data.length ; a++){

                        if (a == i) continue;
                        if (acc_sheet_data[a][approvedProposals_id_index] == old_appr_prop_id) check = false;
                        
                    }

                    if (check){

                        ORDERS_SHEET.getRange(
                            row_num,
                            transfer_status_col
                        ).setValue("Не перенесен");

                    }
                }
            }
        }
        
        if (new_appr_prop_id){

            for (let n = 0 ; n < acc_sheet_data[0].length ; n++){

                if (approvedProposals_id_index == n) continue;

                let key = acc_sheet_data[0][n];
                if (!key) continue;

                let value = orders_data_in_obj?.[new_appr_prop_id]?.[key];
                if (value){

                    SHEET.getRange(
                        ROW_WITH_ABBR + i,
                        FIRST_COL_WITH_DATA + n
                    ).setValue(value);

                }
            }

            SHEET.getRange(
                ROW_WITH_ABBR + i,
                check_appr_prop_id_index + 1
            ).setValue(new_appr_prop_id);

            let transfer_status = orders_data_in_obj?.[new_appr_prop_id]?.["transfer_status"];

            if (transfer_status != "Перенесен"){

                let row_num = orders_data_in_obj?.[new_appr_prop_id]?.["row_number"];
                if (row_num){

                    ORDERS_SHEET.getRange(
                        row_num,
                        transfer_status_col
                    ).setValue("Перенесен");

                }
            }
        }
    }
}

function get_orders_data_in_obj(orders_data_from_sheet) {

    let obj = {};

    let approvedProposals_id_index = orders_data_from_sheet[0].indexOf("approvedProposals_id");

    for (let i = 1 ; i < orders_data_from_sheet.length ; i++){

        let approvedProposals_id = orders_data_from_sheet[i][approvedProposals_id_index];
        if (!approvedProposals_id) continue;

        obj[approvedProposals_id] = {};

        for (let n = 0 ; n < orders_data_from_sheet[0].length ; n++){

            let key = orders_data_from_sheet[0][n];
            let value = orders_data_from_sheet[i][n];
            if (!key || !value) continue;
            
            obj[approvedProposals_id][key] = value;

        }

        obj[approvedProposals_id]["row_number"] = i + ORDERS_ROW_WITH_ABBR;

    }

    return obj;

}