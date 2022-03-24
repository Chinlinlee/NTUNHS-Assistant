function HideTd(i_id) {
    $('[id*="' + i_id + '"]').hide()
}

function ShowTd(i_id) {
    $('[id*="' + i_id + '"]').show()
}

function TdDisplay(i_id) {
    $('[id*="' + i_id + '"]').css('display', 'inline-block')
}
function TdDisplayNoneRWD(i_id) {
    $('[id*="' + i_id + '"]').css('display', 'table-cell')
}
function Item_Visible_Control(i_id, thId, disable) {
    let width = window.innerWidth > 0 ? window.innerWidth : screen.width
    if (width > 736 && disable) {
        return
    }
    if ($('[id*="' + i_id + '"]').is(':visible')) {
        $(`[id='${thId}']`).removeClass('table-th-hide')
        $(`[id='${thId}']`).addClass('table-th-show')
        $('[id*="' + i_id + '"]').hide()
    } else {
        $(`[id='${thId}']`).removeClass('table-th-show')
        $(`[id='${thId}']`).addClass('table-th-hide')
        $('[id*="' + i_id + '"]').show()
    }
}
