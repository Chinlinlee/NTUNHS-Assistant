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
}

async function sleep(ms = 0) 
{
    return new Promise(r => setTimeout(r, ms));
}