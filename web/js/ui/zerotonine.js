

$(function(){
  console.log('init');
  getNewestGameId();
})

function _sleep(milliseconds) {
  return new Promise(resolve => setTimeout(resolve, milliseconds))
}

function getNewestGameId() {
  $.ajax({
      url: `/api/v1/lottery/eos/newest`,
      method: 'get',
    }).done(function(res) {
      console.log(res);
      $(`#newestGameId`).html(res[0].gameid);

      _sleep(5000).then(() => {
        getNewestGameId();
      })
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
      url: `/api/v1/lottery/probability/slice/zerotonine?slice=${optionsRadiosFirb}`,
      method: 'get',
    }).done(function(res) {
      console.log(res);
      if (res && res.length > 0) {
        res.forEach((v, k) => {
          $("#sliceProbability").append(`<span style="color: red">${optionsRadiosFirb}</span>小时投注${k}的中奖概率<span style="color: red">${v}</span>%;<br/>`);
        });
      }
    });
  }
}
