function repair() {

    let arr_with_acc_appr = SHEET.getRange(
        3,
        11,
        SHEET.getLastRow()
    ).getValues();

    let arr_with_ord_appr = ORDERS_SHEET.getRange(
        3,
        1,
        ORDERS_SHEET.getLastRow()
    ).getValues()

    for (let i = 0 ; i < arr_with_acc_appr.length ; i++){

        let acc_num = arr_with_acc_appr[i][0];
        if (!acc_num) continue;

        for (let k = 0 ; k < arr_with_ord_appr.length ; k++){

            ord_num = arr_with_ord_appr[k][0];
            if (!ord_num || ord_num != acc_num) continue;

            ORDERS_SHEET.getRange(k + 3 , 8).setValue("Перенесен");
            break;

        }

    }

}