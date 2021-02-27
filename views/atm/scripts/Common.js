const commonFunc = {
    darkModeInit : function () {
        const options = {
            backgroundColor: '#fff',  // default: '#fff'
            mixColor: '#fff', // default: '#fff'
            saveInCookies: false, // default: true,
            autoMatchOsTheme: false, // default: true
        }
        const darkmode =  new Darkmode(options);
        let isDarkMode = localStorage.getItem("darkMode");
        $("#darkModeSwitch").on("change" ,function () {
            darkmode.toggle();
            if (darkmode.isActivated()) {
                localStorage.setItem("darkMode", "true");
            } else {
                localStorage.setItem("darkMode", "false");
            }
        });
        if (isDarkMode == "true") {
            $("#darkModeSwitch").bootstrapToggle('on');
        }
    },
    myDarkModeInit : function () {
        $("#darkModeSwitch").on("change" ,function () {
            let isActivated = $(this).prop('checked');
            if (isActivated) {
                $('body').addClass(`darkmode--activated`);
                localStorage.setItem("darkMode", "true");
                if (window.Chart) {
                    Chart.defaults.global.defaultFontColor = 'white';
                    Chart.helpers.each(Chart.instances, function(instance){
                        instance.chart.update();
                    });
                }
            } else {
                $('body').removeClass(`darkmode--activated`);
                localStorage.setItem("darkMode", "false");
                if (window.Chart) {
                    Chart.defaults.global.defaultFontColor = 'black';
                    Chart.helpers.each(Chart.instances, function(instance){
                        instance.chart.update();
                    });
                }
            }
        });
        let isDarkMode = localStorage.getItem("darkMode");
        if (isDarkMode == "true") {
            $("#darkModeSwitch").bootstrapToggle('on');
        }
    } , 
    //need to load script with jquery-blockUI
    blockUI : function () {
        $.blockUI({
            message: "<i class='fa fa-spinner fa-pulse orange' style='font-size:600%'></i>", 
            //borderWidth:'0px' 和透明背景
            css: { borderWidth: '0px', backgroundColor: 'transparent' },
        });
        return true;
    }
}

async function sleep(ms = 0) 
{
    return new Promise(r => setTimeout(r, ms));
}