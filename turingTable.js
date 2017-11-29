$(document).ready(function () {
    $('#btnAddCol').click(function () {
        addColumn(document.getElementById("tabela_turing"));
    });

    $('#btnAddLin').click(function () {
        addRow(document.getElementById("tabela_turing"));
    });

    $("#tabela_turing").on("click", "#btnRemoveCol", function () {
        removeColumn(document.getElementById("tabela_turing"), $(this)[0].parentElement.cellIndex);
    });

    $("#tabela_turing").on("click", "#btnRemoveLin", function () {
        removeLine(document.getElementById("tabela_turing"), $(this)[0].parentElement.parentElement.rowIndex);
    });

    $("#btn_json").click(function () {
        document.getElementById("div_resposta").innerText = "";
        if (lastEvents.length > 0) {
            document.getElementById("alerta").innerText = "";
            saveJson(document.getElementById("tabela_turing"));
        } else {
            document.getElementById("alerta").innerText = "Defina pelo menos um estado final";
        }

    });

    $("#tabela_turing").on("click", "td", function () {
        if ($(this)[0].cellIndex == 0 && $(this)[0].parentElement.rowIndex != 1){
            toggleLastEvent(document.getElementById("tabela_turing"), $(this)[0].parentElement.rowIndex);
        }
    });
});

var lastEvents = [];

function saveJson(tbl) {
    class JsonObj{
        constructor(machineName, word, transitions, states){
            this.machineName = machineName;
            this.word = word;
            this.transitions = transitions;
            this.states = states;
        }
    };

    class State{ 
        constructor(isFinal, name){
            this.name = name;
            this.transitions = [];
            this.isFinal = isFinal;
        }
    };

    class Transition{
        constructor(name, targetState, transitionSymbol, writeSymbol, action){
            this.name = name;
            this.targetState = targetState;
            this.transitionSymbol = transitionSymbol;
            this.writeSymbol = writeSymbol;
            this.action = action;
        }
    };

    var transitions = [];
    var states = [];

    for (var y = 1; y < tbl.rows.length; y++) {
        var state = new State(($.inArray((tbl.rows[y].cells[0].innerText), lastEvents) == -1 ? false : true), tbl.rows[y].cells[0].innerText);
        
        for (var x = 1; x < tbl.rows[y].cells.length; x++) {
            var partsOfStr = tbl.rows[y].cells[x].innerHTML.split(',');
            var transition = new Transition("transition" + x + y, partsOfStr[0], tbl.rows[0].cells[x].innerText, partsOfStr[1], partsOfStr[2]);
            transitions.push(transition);
            state.transitions.push(transition.name);
        }

        states.push(state);
    };

    var obj = new JsonObj("Minha máquina",document.getElementById("palavra").value, transitions, states);
    console.log(JSON.stringify(obj, null, 2));

    $.ajax({
        type: 'post',
        url: 'https://teoria.nicolas.eti.br:8080/send',
        data: JSON.stringify(obj),
        contentType: "application/json; charset=utf-8",
        traditional: true,
        success: function (data) {
            console.log(data);
            if(data.FinalState)
                document.getElementById("div_resposta").innerText = "A palavra foi aceita pela máquina";
            else
                document.getElementById("div_resposta").innerText = "A palavra não foi aceita pela máquina";
        }
    });
}

function toggleLastEvent(tbl, rowIndex) {
    if (rowIndex > 0 && rowIndex < tbl.rows.length) {
        if($.inArray(tbl.rows[rowIndex].cells[0].innerText, lastEvents) == -1){
            lastEvents.push(tbl.rows[rowIndex].cells[0].innerText);
            console.log(lastEvents);
            for (var y = 2; y < tbl.rows.length; y++) {
                tbl.rows[y].cells[0].style.backgroundColor = "#eeeeee"
            }
    
            for(var indexes = 0; indexes < lastEvents.length; indexes++)
                for (var y = 1; y < tbl.rows.length; y++) 
                    if(tbl.rows[y].cells[0].innerText == lastEvents[indexes])
                        tbl.rows[y].cells[0].style.backgroundColor = "#ffcccc";
        }else{
            lastEvents.splice(lastEvents.indexOf(tbl.rows[rowIndex].cells[0].innerText), 1);
            console.log(lastEvents);

            for (var y = 2; y < tbl.rows.length; y++) {
                tbl.rows[y].cells[0].style.backgroundColor = "#eeeeee"
            }
    
            for(var indexes = 0; indexes < lastEvents.length; indexes++)
                for (var y = 1; y < tbl.rows.length; y++) 
                    if(tbl.rows[y].cells[0].innerText == lastEvents[indexes])
                        tbl.rows[y].cells[0].style.backgroundColor = "#ffcccc";
        }
    }
}

function updateStateNumbers(tbl) {
    var button = document.createElement("input");
    button.value = "-";
    button.type = "button";
    button.id = "btnRemoveLin";
    button.innerHTML = "-";

    for (var y = 2; y < tbl.rows.length; y++) {
        if (y != 0) {
            var temp = tbl.rows[y].cells[0].innerHTML;
            tbl.rows[y].cells[0].innerHTML ="";
            tbl.rows[y].cells[0].append(button);
            tbl.rows[y].cells[0].innerHTML += "<b>q"+(y-1)+"</b>";
        }
    }
}

function removeLine(tbl, lineNum) {
    tbl.rows[lineNum].remove();

    updateStateNumbers(document.getElementById("tabela_turing"));

    lastEvents = [];
    for (var y = 2; y < tbl.rows.length; y++) {
        if(tbl.rows[y].cells[0].style.backgroundColor == "rgb(255, 204, 204)"){
            lastEvents.push(tbl.rows[y].cells[0].innerText);
        }

    }

    console.log(lastEvents);
}

function removeColumn(tbl, colNum) {
    for (var y = 0; y < tbl.rows.length; y++) {
        tbl.rows[y].cells[colNum].remove();
    }
}

function addColumn(tbl) {
    var button = document.createElement("input");
    button.value = "-";
    button.type = "button";
    button.id = "btnRemoveCol";
    button.innerHTML = "-";
    //button.children[0].class = "unselectable";

    for (var y = 0; y < tbl.rows.length; y++) {
        var cell = tbl.rows[y].insertCell(tbl.rows[y].cells.length);
        cell.contentEditable = true;
        if (y == 0) {
            cell.innerHTML = "<b>letra " + cell.cellIndex + "</b>";
            cell.append(button);
        } else {
            cell.innerHTML = "";
        }
    }
}

function addRow(tbl) {
    var button = document.createElement("input");
    button.value = "-";
    button.type = "button";
    button.id = "btnRemoveLin";
    button.innerHTML = "-";

    var row = tbl.insertRow(tbl.rows.length);
    for (var x = 0; x < tbl.rows[0].cells.length; x++) {
        var cell = row.insertCell();
        if (x == 0) {
            cell.append(button);
            cell.innerHTML += "<b>q" + (row.rowIndex-1) + "</b>";

        } else {
            cell.innerHTML = "";
            cell.contentEditable = true;
        }
    }
}
