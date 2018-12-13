

$(function(){
  console.log('init');
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

function doTransfer() {
  var privateKey = $("#privateKey").val();
  console.log(privateKey);
  var actor = $("#actor").val();
  console.log(actor);
  var quantity = $("#quantity").val();
  console.log(quantity);
  var optionsRadiosDaxiao = $("input[name=optionsRadiosDaxiao]:checked").val();
  console.log(optionsRadiosDaxiao);
  var optionsRadiosDanShuang = $("input[name=optionsRadiosDanShuang]:checked").val();
  console.log(optionsRadiosDanShuang);

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
      console.log(res);
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
      console.log(res);
      $(`#newestGameId`).html(res[0].gameid);
    });
}

function getAllProbability() {
  $.ajax({
      url: `/api/v1/lottery/probability/all`,
      method: 'get',
    }).done(function(res) {
      console.log(res);
      if (res && res.length > 0) {
        for (let r in res) {
          console.log(r)
          $(`#allProbability-${r}`).html(res[r].p);
        }
      }
    });
}

function doSliceAnalizy() {
  var optionsRadiosFirb = $("input[name=optionsRadiosFirb]:checked").val();
  console.log(optionsRadiosFirb);

  if (!optionsRadiosFirb) {
    alert('请选择小时数！');
    return;
  } else {
    $("#sliceProbability").html('');
    $.ajax({
      url: `/api/v1/lottery/probability/slice/dxds?slice=${optionsRadiosFirb}`,
      method: 'get',
    }).done(function(res) {
      console.log(res);
      if (res && res.length > 0) {
          for (let r of res) {
            console.log(r);
            $("#sliceProbability").append(`<span style="color: red">${optionsRadiosFirb}</span>小时投注${r.dxds}的中奖概率<span id="sliceProbability" style="color: red">${r.p}</span>%;<br/>`);
          }
      }
    });
  }
}

function dealLocalStorage(type, data = null) {
  if (type === "set") {
    console.log(data)
    localStorage.setItem("secret", JSON.stringify(data));
  } else {
    const secret = localStorage.getItem("secret");
    console.log(secret)

    if (secret) {
      return JSON.parse(secret);
    } else {
      return null;
    }
  }
}
