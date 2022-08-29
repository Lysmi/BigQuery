function trigger_on_open() {
    var menuEntries = [];
    menuEntries.push({ name: "Обновить файлы с историей заказов", functionName: "button_refresh_history_clients" });

    SS.addMenu("Дополнительные функции", menuEntries);
}


function onOpen() {
    var menu = SpreadsheetApp.getUi() // Or DocumentApp or SlidesApp or FormApp.
        .createMenu('База данных');

    menu.addItem('Загрузить', 'showDialog');
    menu.addItem('Cохранить', 'saveInDB')
        .addToUi();
}


function showDialog() {
    var html = HtmlService.createHtmlOutputFromFile('index');
    SpreadsheetApp.getUi() // Or DocumentApp or SlidesApp or FormApp.
        .showModalDialog(html, 'Choose date');
}
