function trigger_fill_order_data(e) {

    let active_cell = e.range;
    let active_row = active_cell.getRow();

    if (active_row <= ROW_WITH_ABBR) return;

    let active_col = active_cell.getColumn()

    let sheet_abbr_data = SHEET.getRange(
        ROW_WITH_ABBR,
        FIRST_COL_WITH_DATA,
        1,
        SHEET.getLastColumn() - FIRST_COL_WITH_DATA + 1
    ).getValues();

    let arr_num_with_approved_proposals_id = sheet_abbr_data[0].indexOf("approvedProposals_id");

    if (active_col != arr_num_with_approved_proposals_id + FIRST_COL_WITH_DATA) return;

    let col_num_suplRequest_companyName = sheet_abbr_data[0].indexOf("suplRequest_companyName") + FIRST_COL_WITH_DATA;
    let check_appr_prop_id_col_num = sheet_abbr_data[0].indexOf("check_appr_prop_id") + FIRST_COL_WITH_DATA;

    let old_order_num = e.oldValue;
    let new_order_num = e.value;

    let orders_abbr_data = ORDERS_SHEET.getRange(
        ORDERS_ROW_WITH_ABBR,
        ORDERS_FIRST_COL_WITH_DATA,
        1,
        ORDERS_SHEET.getLastColumn() - ORDERS_FIRST_COL_WITH_DATA + 1
    ).getValues();

    let orders_arr_num_with_approved_proposals_id = orders_abbr_data[0].indexOf("approvedProposals_id")
    let orders_arr_num_with_transfer_status = orders_abbr_data[0].indexOf("transfer_status");

    let orders_approved_proposals_id_col_data = ORDERS_SHEET.getRange(
        ORDERS_ROW_WITH_ABBR,
        ORDERS_FIRST_COL_WITH_DATA + orders_arr_num_with_approved_proposals_id,
        ORDERS_SHEET.getLastRow() - ORDERS_ROW_WITH_ABBR + 1
    ).getValues();

    SHEET.getRange(
        ORDERS_ROW_WITH_ABBR + 1,
        col_num_suplRequest_companyName,
        SHEET.getMaxRows() - ORDERS_ROW_WITH_ABBR
    ).clearDataValidations();

    orders_vert: for (let k = 1 ; k < orders_approved_proposals_id_col_data.length ; k++){

        orders_approved_proposals_id = orders_approved_proposals_id_col_data[k][0];

        if (orders_approved_proposals_id == old_order_num){

            ORDERS_SHEET.getRange(ORDERS_ROW_WITH_ABBR + k , ORDERS_FIRST_COL_WITH_DATA + orders_arr_num_with_transfer_status).setValue("Не перенесен");

            if (!new_order_num){
                
                acc_horiz: for (let n = 0 ; n < sheet_abbr_data[0].length ; n++){

                    let acc_data_type = sheet_abbr_data[0][n];
                    if (!acc_data_type || acc_data_type.includes("acc_")) continue;

                    SHEET.getRange(active_row , FIRST_COL_WITH_DATA + n).setValue(null);
                        
                }

                break orders_vert;

            }
        }

        if (orders_approved_proposals_id == new_order_num){

            let orders_row_data = ORDERS_SHEET.getRange(
                ORDERS_ROW_WITH_ABBR + k,
                ORDERS_FIRST_COL_WITH_DATA,
                1,
                ORDERS_SHEET.getLastColumn() - ORDERS_FIRST_COL_WITH_DATA + 1
            ).getValues();

            acc_horiz: for (let n = 0 ; n < sheet_abbr_data[0].length ; n++){

                let acc_data_type = sheet_abbr_data[0][n];
                if (!acc_data_type) continue;

                let orders_data_type_index = orders_abbr_data[0].indexOf(acc_data_type);
                if (orders_data_type_index == -1) continue;

                SHEET.getRange(active_row , FIRST_COL_WITH_DATA + n).setValue(orders_row_data[0][orders_data_type_index]);

            } 

            ORDERS_SHEET.getRange(ORDERS_ROW_WITH_ABBR + k , ORDERS_FIRST_COL_WITH_DATA + orders_arr_num_with_transfer_status).setValue("Перенесен");

            break orders_vert;

        }
    } 

    if (new_order_num){
        SHEET.getRange(
            active_row,
            check_appr_prop_id_col_num
        ).setValue(new_order_num);
    }
    else{
        SHEET.getRange(
            active_row,
            check_appr_prop_id_col_num
        ).clearContent();
    }

    SHEET.getRange(
        ORDERS_ROW_WITH_ABBR + 1,
        col_num_suplRequest_companyName,
        SHEET.getMaxRows() - ORDERS_ROW_WITH_ABBR
    ).setDataValidation(SpreadsheetApp.newDataValidation()
    .setAllowInvalid(true)
    .requireValueInRange(SHEET.getRange('\'Справочник\'!$A$4:$A'), true)
    .build());
    
}

function trigger_set_last_update_time(e) {

    return;
    
    let active_cell = e.range;
    let active_row = active_cell.getRow();

    if (active_row <= ROW_WITH_ABBR) return;

    let abbr_data = SHEET.getRange(
        ROW_WITH_ABBR,
        FIRST_COL_WITH_DATA,
        1,
        SHEET.getLastColumn() - FIRST_COL_WITH_DATA + 1
    ).getValues();

    let col_num_last_update = FIRST_COL_WITH_DATA + abbr_data[0].indexOf("acc_last_update");

    SHEET.getRange(active_row , col_num_last_update).setValue(new Date())
    
}
