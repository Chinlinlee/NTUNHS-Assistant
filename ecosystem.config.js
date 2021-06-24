module.exports = {
    apps: [{
        name: 'mycosim',
        script: 'server.js',
        watch: false,
        ignore_watch: ["node_modules", "pm2log", "docx", "pdf", "picture", "xlsx", "*.log"],
        exec_mode: 'cluster',
        instances: 5,
        max_memory_restart: '1000M',
        time: true,
        log_date_format: 'YYYY-MM-DD HH:mm Z',
        force: true,
        wait_ready: false,
        max_restarts: 10,
        // 單位為 ms, 預設為 0, 若有指定時間，則 app 會等待指定時間過後重啟
        autorestart: true,
        error_file: './pm2log/err.log',
        // 正常輸出 log 的指定位置
        out_file: './pm2log/out.log',
        log_file: './pm2log/log.log'
    }]
};