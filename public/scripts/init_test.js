$(function () {
    $('[data-toggle="tooltip"]').tooltip()
})
$(document).ready(function () {
    $("#seconds").click(function () {
        seconds = $("#seconds").val().replace("00:00", "");
    });
});

seconds = $("#seconds").val();
const totalCarregamento = async function (qtd, only = false) {
    if (only)
        return $("#countTotal")[0].textContent = qtd

    const value = parseInt($("#countTotal")[0].textContent) + qtd;
    $("#countTotal")[0].textContent = value
}

const moreOne = async function (elementId) {
    const element = $(`#${elementId}`)[0];
    var value = parseInt(element.textContent);
    element.textContent = value + 1;
}

const accountLive = async function (value) {
    $("#listaprovadas").append(value + "<br>");
    moreOne("countLives");
    moreOne("countChecked");
}

const accountLivePlus = async function (value) {
    $("#listaprovadasplus").append(value + "<br>");
    moreOne("countLives");
    moreOne("countChecked");
}

const accountDie = async function (value) {
    $("#listreprovadas").append(value + "<br>");
    moreOne("countDies");
    moreOne("countChecked");
}

const accountError = async function (value) {
    moreOne("countError");
    moreOne("countChecked");
}

const clearList = async function (verify, value) {
    if (verify && value == 10)
        $("#lista")[0].value = "";
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

const esconder = async function (type) {
    var value = $(`.${type}`)[0].style.display;
    $(`.${type}`)[0].style.display = value ? "" : "none";
}

const copiarlist = async function (type) {
    var copyText = $(`.${type}`)[0]
    window.getSelection().selectAllChildren(copyText);
    document.execCommand("copy");
}

const resetChecker = function () {
    $("#countChecked")[0].textContent[0] = "0";
    $("#countTotal")[0].textContent[0] = "0";
    $("#countLives")[0].textContent[0] = "0";
    $("#countDies")[0].textContent[0] = "0";
}

const removelinha = function () {
    var lines = $("#lista").val().split('\n');
    lines.splice(0, 1);
    $("#lista").val(lines.join("\n"));
}

const checkar = async function (value) {
    $.ajax({
        url: "api?lista=" + value,
        method: "GET",
        async: true,
        contentType: 'application/json',
        success: function (response) {
            var testadas = parseInt($("#countChecked")[0].textContent)
            var total = parseInt($("#countTotal")[0].textContent)
            if ((total - testadas) <= 2)
                $("#start")[0].disabled = false;

            var value = response;
            if (response.match("#APROVADA")) {
                accountLivePlus(value);
            } else if (response.match("#Aprovada")) {
                accountLive(value);
            } else if (response.match("#Reprovada")) {
                accountDie(value)
            } else {
                accountError(value)
            }
            removelinha();
        }
    })
}

const stop = async function () {
    $("#start")[0].disabled = false;
    _continue = false;
}
var _continue;

const start = async function (name) {
    const time = seconds * 1000;
    console.log(seconds);
    _continue = true;
    var values = $("#lista").val()

    var filter = duplicateRemove(values)

    if (!filter.length)
        return stop();

    $("#lista").text(filter.join("\n"));
    if (filter.length > 1000) return alert("Coloque no maximo 1000 Linhas. Carregado: ".concat(filter.length))
    resetChecker()
    totalCarregamento(filter.length);
    $("#start")[0].disabled = true;

    for (var i = 0; i < filter.length; i++) {
        if (!_continue) {
            break;
        }
        var value = filter[i];
        //console.log('aguardando...')
        //await sleep(5000)
        //console.log('2 segundos')
        checkar(value);
        await sleep(time);
    }
}

const duplicateRemove = function (text) {
    var linhas = text.split('\n');

    var newArr = linhas.filter(function (element, i) {
        return (linhas.indexOf(element) === i && element.length);
    })

    return newArr.length ? newArr : false;
}