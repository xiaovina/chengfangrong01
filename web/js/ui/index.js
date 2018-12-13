

$(function(){
  // initialize input widgets first
  $('#AnalizyForm .time').timepicker({
      'showDuration': true,
      'timeFormat': 'H:i'
  });

  $('#AnalizyForm .date').datepicker({
      'format': 'm/d/yyyy',
      'autoclose': true
  });

  // initialize datepair
  var basicExampleEl = document.getElementById('AnalizyForm');
  var datepair = new Datepair(basicExampleEl);

  getNonstop();

  var data = dealLocalStorage("get");
  if (data && data.privateKey && data.actor) {
    $("#privateKey").val(data.privateKey);
    $("#actor").val(data.actor);
  }
})

function _sleep(milliseconds) {
  return new Promise(resolve => setTimeout(resolve, milliseconds))
}
function doAnalizy() {
  var startDate = $("#startDate").val();
  var startTime = $("#startTime").val();
  const start = `${startDate} ${startTime}`;

  var endDate = $("#endDate").val();
  var endTime = $("#endTime").val();
  const end = `${endDate} ${endTime}`;

  $.ajax({
      url: `/api/v1/lottery/analizy/all?start=${start}&end=${end}`
    }).done(function(res) {

      $("#AnalizyResult .totalGame").html(res.total);
      $("#AnalizyResult .analizyList").html('');
      if (res.total > 0 && res.analizyList) {
        let daSum = 0;
        let xiaoSum = 0;
        let danSum = 0;
        let shuangSum = 0;
        for (let i = 0; i < 20; i++) {

          daSum += res.analizyList.daResult[i] * (i+1);
          xiaoSum += res.analizyList.xiaoResult[i] * (i+1);
          danSum += res.analizyList.danResult[i] * (i+1);
          shuangSum += res.analizyList.shuangResult[i] * (i+1);
          $("#AnalizyResult .analizyList").append(`
          <div class=\"row\">
            <div class=\"col-sm-2\">${i+1}次</div>
            <div class=\"col-sm-2\">${res.analizyList.daResult[i]}次</div>
            <div class=\"col-sm-2\">${res.analizyList.xiaoResult[i]}次</div>
            <div class=\"col-sm-2\">${res.analizyList.danResult[i]}次</div>
            <div class=\"col-sm-2\">${res.analizyList.shuangResult[i]}次</div>
          </div>
          `)
        }
        $("#daSum").html(daSum);
        $("#xiaoSum").html(xiaoSum);
        $("#danSum").html(danSum);
        $("#shuangSum").html(shuangSum);
      }
    });
}

function doTransfer() {
  var privateKey = $("#privateKey").val();
  var actor = $("#actor").val();
  var quantity = $("#quantity").val();
  var optionsRadiosDaxiao = $("input[name=optionsRadiosDaxiao]:checked").val();
  var optionsRadiosDanShuang = $("input[name=optionsRadiosDanShuang]:checked").val();

  var flag = true;
  if (!privateKey || privateKey.length != 51) {
    flag = false;
  }
  if (!actor || actor.length != 12) {
    flag = false;
  }
  if (!quantity || quantity < 0.0001 || quantity > 100) {
    flag = false;
  }
  if(!optionsRadiosDaxiao && !optionsRadiosDanShuang) {
    flag = false;
  }

  let data = {
    privateKey,
    actor,
    quantity
  }
  if (flag) {
    dealLocalStorage("set", data);
    $("#transferResult").html('投注中...');
    if (optionsRadiosDaxiao) {
      data.daxiaodanshuang = optionsRadiosDaxiao
      postTransfer(data);
    }

    if (optionsRadiosDanShuang) {
      data.daxiaodanshuang = optionsRadiosDanShuang
      postTransfer(data);
    }
  } else {
    $("#transferResult").html('请检查投注参数是否正确填写！');
  }
}

function postTransfer(data) {
  $.ajax({
      url: `/api/v1/lottery/eos/transfer`,
      method: 'post',
      data: data
    }).done(function(res) {
      console.log(res);
      $("#transferResult").html('');
      if (res && res.transaction_id) {
        $("#transferResult").append(`投注成功，交易ID为：${res.transaction_id}`);
      } else {
        $("#transferResult").append("投注失败，请检查eosplay网站，再重试。");
      }
    });
}

function getNonstop() {
  $("#nonstopDaXiao").html('...')
  $("#nonstopDaXiaoTimes").html('...')
  $("#nonstopDanShuang").html('...')
  $("#nonstopDanShuangTimes").html('...')

  getAllProbability();
  getNewestGameId();
  $.ajax({
      url: `/api/v1/lottery/analizy/nonstop`,
      method: 'get',
    }).done(function(res) {
      $("#transferResult").html('');
      if (res && res.length === 2) {
        $("#nonstopDaXiao").html(res[0].daxiaodanshaung)
        $("#nonstopDaXiaoTimes").html(res[0].nonstopCount)
        $("#nonstopDanShuang").html(res[1].daxiaodanshaung)
        $("#nonstopDanShuangTimes").html(res[1].nonstopCount)

        _sleep(2000).then(() => {
          getNonstop();
        })
      }
    });
}

function getNewestGameId() {
  $.ajax({
      url: `/api/v1/lottery/eos/newest`,
      method: 'get',
    }).done(function(res) {
      $(`#newestGameId`).html(res[0].gameid);
    });
}
function getAllProbability() {
  $.ajax({
      url: `/api/v1/lottery/probability/all`,
      method: 'get',
    }).done(function(res) {
      if (res && res.length > 0) {
        for (let r in res) {
          $(`#allProbability-${r}`).html(res[r].p);
        }
      }
    });
}

function doSliceAnalizy() {
  var optionsRadiosFirb = $("input[name=optionsRadiosFirb]:checked").val();

  if (!optionsRadiosFirb) {
    alert('请选择小时数！');
    return;
  } else {
    var limit = _sliceMapping(optionsRadiosFirb);



    $("#sliceProbability").html('');
    $.ajax({
      url: `/api/v1/lottery/probability/slice?slice=${optionsRadiosFirb}`,
      method: 'get',
    }).done(function(res) {
      if (res && res.length > 0) {
          for (let r of res) {
            $("#sliceProbability").append(`<span style="color: red">${optionsRadiosFirb}</span>小时投注${r.dxds}的中奖概率<span id="sliceProbability" style="color: red">${r.p}</span>%;<br/>`);
          }
      }

    });
  }
}

function dealLocalStorage(type, data = null) {
  if (type === "set") {
    localStorage.setItem("secret", JSON.stringify(data));
  } else {
    const secret = localStorage.getItem("secret");

    if (secret) {
      return JSON.parse(secret);
    } else {
      return null;
    }
  }
}

function _sliceMapping(slice) {
    slice = Number(slice);
    if (slice ===2) {
      return 2;
    }
    if (slice ===5) {
      return 3;
    }
    if (slice ===8) {
      return 3;
    }
    if (slice ===13) {
      return 4;
    }
    if (slice ===21) {
      return 4;
    }
    if (slice ===34) {
      return 5;
    }
    if (slice ===55) {
      return 5;
    }
    if (slice ===89) {
      return 6;
    }
    if (slice ===144) {
      return 8;
    }
    if (slice ===233) {
      return 9;
    }
  }
