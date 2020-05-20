// formSheet - Таблица ответов на форму "I-RP Admin's Team"
// admSheet - Таблица текущих администраторов проекта
let formSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("form");
let admSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("adm");

// Последняя строка таблицы формы и таблицы администрации
let formLastRow = formSheet.getLastRow();
let admLastRow = admSheet.getLastRow();

// Открытие "Settings"
function onSettingsOpen() {
	let htmlOutput =  HtmlService.createHtmlOutputFromFile("settings.html").setTitle("Settings");
	let ui = SpreadsheetApp.getUi();
	ui.showSidebar(htmlOutput);
}

//Вызывается при открытии таблицы
function onOpen(e) {
  SpreadsheetApp.getUi()
      .createAddonMenu()
	  .addItem("Open", "onControlPanelOpen")
	  .addItem("Settings", "onSettingsOpen")
      .addToUi();
}

// Вызывается на тригер "Отправка формы" (I-RP Admin's Team)
function onFormPush() {

  let formInfoRange = formSheet.getRange(formLastRow, 2, 1, 4).getValues();

  let newAdminInfo = new Map();

  newAdminInfo.set("name", formInfoRange[0][0]);
  newAdminInfo.set("role", formInfoRange[0][1]);
  newAdminInfo.set("nick", formInfoRange[0][2]);
  newAdminInfo.set("url", formInfoRange[0][3]);

  if(!hasAdmin(newAdminInfo.get("nick"))) {
    admSheet.insertRowAfter(2);

	let newRow = admSheet.getRange(3, 1, 1, 6);

	// formating new row
	newRow.setBackground("white");
	newRow.setFontWeight("normal");

    admSheet.getRange(3, 1).setValue(newAdminInfo.get("name"));
    admSheet.getRange(3, 2).setValue(newAdminInfo.get("role"));
    admSheet.getRange(3, 3).setValue(newAdminInfo.get("nick"));
    admSheet.getRange(3, 4).setValue(newAdminInfo.get("url"));
    admSheet.getRange(3, 5).setValue("0/3 ⚠️");
	admSheet.getRange(3, 6).setValue("0/3 ❌");
	
	showAlert(`Администратор${newAdminInfo.get("nick")} добавлен.`);

  } else {
	  Logger.log(`Администратор ${newAdminInfo.get("nick")} уже есть в таблице.`);
	  showAlert(`Администратор ${newAdminInfo.get("nick")} уже есть в таблице.`)
  }
}

// Проверка наличия администратора в таблице текущей администрации !ПО НИКУ!
function hasAdmin(admin) {

  let admNicks = admSheet.getRange(2, 3, admLastRow - 5).getValues();
  let hasAdmin = false;
  
  for(let i = 0; i < admNicks.length; i++) {
    if(admNicks[i] == admin) {
      hasAdmin = true; 
    }
  }

  return hasAdmin;
}

// Открытие Control Panel UI
function onControlPanelOpen() {
  
  let htmlOutput =  HtmlService.createTemplateFromFile("index").evaluate().setWidth(1024);
  let ui = SpreadsheetApp.getUi();
  ui.showModalDialog(htmlOutput, " ");
  
}

// Возвращает информацию об администраторе
function getAdminsInfo() {
  return admSheet.getRange(2, 1, admLastRow - 4, 6).getValues();
}

// Снимает администратора
function removeAdmin(admin) {
  let admins = admSheet.getRange(2, 1, admLastRow - 4, 4).getValues();
  let index = undefined;

  for(let i = 0; i < admins.length; i++) {
    for(let j = 0; j < admins[i].length; j++) {
      if(admins[i][j] == admin) {
        index = i;
      }
    }
  }

  admSheet.deleteRow(index + 2);

  return admin;
}

// Выдаёт администратору предупреждение
function setPred(admin) {
  let admins = admSheet.getRange(2, 1, admLastRow - 4, 6).getValues();
  let index = undefined;

  for(let i = 0; i < admins.length; i++) {
    for(let j = 0; j < admins[i].length; j++) {
      if(admins[i][j] == admin) {
        index = i;
      }
    }
  }

  let adminRange = admSheet.getRange(index + 2, 1, 1, 6);

  let nowPredsRange = admSheet.getRange(index + 2, 5);
  let nowWarnsRange = admSheet.getRange(index + 2, 6);

  let nowPreds = nowPredsRange.getValue()[0];
  let nowWarns = nowWarnsRange.getValue()[0];

  if(nowPreds == 3 && nowWarns == 3) {
    let ui = SpreadsheetApp.getUi();
    ui.alert("Control Panel", "❌ У администратора максимальное кол-во выговоров!", ui.ButtonSet.OK);
    return;
  }

  if(nowPreds == 2) {
    if(nowWarns != 3) {
      nowPredsRange.setValue(`0/3 ⚠️`)
      nowWarnsRange.setValue(`${parseInt(nowWarns) + 1}/3 ❌`);
    } else {
      nowPredsRange.setValue(`3/3 ⚠️`)
      nowWarnsRange.setValue(`3/3 ❌`);
      adminRange.setBackground("crimson");
    }
  } else {
    nowPredsRange.setValue(`${parseInt(nowPreds) + 1}/3 ⚠️`)
  }

  return admin;
}

// Выдаёт администратору выговор
function setWarn(admin) {
  let admins = admSheet.getRange(2, 1, admLastRow - 4, 6).getValues();
  let index = undefined;

  for(let i = 0; i < admins.length; i++) {
    for(let j = 0; j < admins[i].length; j++) {
      if(admins[i][j] == admin) {
        index = i;
      }
    }
  }

  let adminRange = admSheet.getRange(index + 2, 1, 1, 6);

  let nowPredsRange = admSheet.getRange(index + 2, 5);
  let nowWarnsRange = admSheet.getRange(index + 2, 6);

  let nowWarns = nowWarnsRange.getValue()[0];


  if(nowWarns < 3) {
    nowWarnsRange.setValue(`${parseInt(nowWarns) + 1}/3 ❌`);
  } else {
    let ui = SpreadsheetApp.getUi();
    ui.alert("Control Panel", "❌ У администратора максимальное кол-во выговоров!", ui.ButtonSet.OK);
    return;
  }


  return admin;
}

// Скрипт для вставки кода в файлы HTML
function include(filename){
  return HtmlService.createHtmlOutputFromFile(filename)
  .getContent();
}

function showAlert(msg) {
	Browser.msgBox(msg);
}





