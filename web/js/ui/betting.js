
$(function(){
  console.log('init');
  getConfig();
})

function _sleep(milliseconds) {
  return new Promise(resolve => setTimeout(resolve, milliseconds))
}

function getConfig() {
  $.ajax({
    url: `/api/v1/betting/config`,
    method: 'get',
  }).done(function(res) {
    console.log(res);
    if (res && res.length > 0) {
      let tbody = "";
      for (const item of res) {
        tbody += "<tr>";
          tbody += "<th scope=\"row\">" + item.id + "</th>";
          tbody += "<td>" + item.oneHour + "%</th>";
          tbody += "<td>" + item.beforeOneHour + "%</td>";
          tbody += "<td>" + item.bettingTimes + "</td>";
          tbody += "<td>" + item.maxWinTimes + "</td>";
          tbody += "<td>" + item.amount + "</td>";
          tbody += "<td>" + item.toUserName + "</td>";
          tbody += "<td>" + item.memo + "</td>";
          tbody += "<td>" + item.item + "</td>";
          tbody += "<td>" + item.isReal + "</td>";
          tbody += "<td>" + item.status + "</td>";
          tbody += "<td><a href=\"#\" onclick=\"changeStatus(" + item.id + ", 0)\" >开始</a> | <a href=\"#\" onclick=\"changeStatus(" + item.id + ", 2)\" >停止</a> | <a href=\"#\" onclick=\"deleteConfig(" + item.id + ")\" >删除</a> | <a href=\"#\" onclick=\"queryConfig(" + item.frequencyId + ")\" >查询</a></td>";
        tbody += "</tr>";
      }
      $("#configList").html(tbody);
    }
  });
}

function changeStatus(id, status) {
  $.ajax({
    url: `/api/v1/betting/config/status/`,
    data: {
      id, status
    },
    method: 'post',
  }).done(function(res) {
    getConfig();
  });
}

function deleteConfig(id) {
  $.ajax({
    url: `/api/v1/betting/config/delete/`,
    data: {
      id
    },
    method: 'post',
  }).done(function(res) {
    getConfig();
  });
}

function queryConfig(frequencyId) {
  $.ajax({
    url: `/api/v1/betting/config/frequency?frequencyId=${frequencyId}`,
    method: 'get'
  }).done(function(res) {
    // dialog
    dealFrequencyModal(res);
  });
}

function createConfig() {
  const oneHour = $("#oneHour").val();
  const beforeOneHour = $("#beforeOneHour").val();
  const bettingTimes = $("#bettingTimes").val();
  const maxWinTimes = $("#maxWinTimes").val();
  const amount = $("#amount").val();
  const item = $("#item").val();
  const memo = $("#memo").val();
  const isReal = $("input[name=isReal]:checked").val();
  const toUserName = $("#toUserName").val();
  const username = $("#username").val();
  const privateKey = $("#privateKey").val();


  const data = {
    isReal,
    username,
    privateKey,
    configEx: {
      oneHour,
      beforeOneHour,
      bettingTimes,
      maxWinTimes,
      amount,
      item,
      memo,
      toUserName,
    }
  }
  $.ajax({
    url: `/api/v1/betting/config/new/`,
    data,
    method: 'post',
  }).done(function(res) {
    $("#createResult").html(res);
    getConfig();
  });
}

function dealFrequencyModal(data) {
  if (data && data.list && data.list.length > 0) {
    $("#winCount").html(data.winCount);
    $("#lostCount").html(data.lostCount);
    $("#dealingCount").html(data.dealingCount);
    $("#modalTotal").html(data.total);


    let tbody = "";
      for (const item of data.list) {
        tbody += "<tr>";
          tbody += "<th scope=\"row\">" + item.result + "</th>";
          tbody += "<td>" + item.recordTime + "</th>";
          tbody += "<td>" + item.isWin + "</td>";
        tbody += "</tr>";
      }
    $("#modalContent").html(tbody);
  }

  $('#myModal').modal("show");
}

function _resetFrequencyModal() {
  $("#winCount").html('');
  $("#lostCount").html('');
  $("#dealingCount").html('');
  $("#modalTotal").html('');
  $("#modalContent").html('');
}
