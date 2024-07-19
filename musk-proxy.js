const fs = require('fs');
const path = require('path');
const axios = require('axios');
const readline = require('readline');
const { HttpsProxyAgent } = require('https-proxy-agent');

class MuskEmpireAPI {
    headers(apiKey) {
        return {
            "Accept": "*/*",
            "Content-Type": "application/json",
            "Api-Key": apiKey,
            "Origin": "https://game.muskempire.io",
            "Referer": "https://game.muskempire.io/",
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
        };
    }

    async auth(initData, proxy) {
        const url = "https://api.muskempire.io/telegram/auth";
        const chatInstanceMatch = initData.match(/chat_instance=([^&]*)/);
        const chatInstance = chatInstanceMatch ? chatInstanceMatch[1] : '';
        
        const payload = {
            data: {
                initData: initData,
                platform: "android",
                chatId: "",
                chatType: "sender",
                chatInstance: chatInstance
            }
        };
        
        const proxyAgent = new HttpsProxyAgent(proxy);
        const response = await axios.post(url, payload, { 
            headers: this.headers(), 
            httpsAgent: proxyAgent 
        });
        return response.data;
    }

    async getUserData(apiKey, proxy) {
        const url = "https://api.muskempire.io/user/data/all";
        const payload = { data: {} };
        const headers = this.headers(apiKey);
        
        const proxyAgent = new HttpsProxyAgent(proxy);
        const response = await axios.post(url, payload, { 
            headers, 
            httpsAgent: proxyAgent 
        });
        return response.data;
    }

    async claimDailyReward(apiKey, rewardId, proxy) {
        const url = "https://api.muskempire.io/quests/daily/claim";
        const payload = { data: rewardId };
        const headers = this.headers(apiKey);
        
        const proxyAgent = new HttpsProxyAgent(proxy);
        const response = await axios.post(url, payload, { 
            headers, 
            httpsAgent: proxyAgent 
        });
        return response.data;
    }

    async getDB(apiKey, proxy) {
        const url = "https://api.muskempire.io/dbs";
        const payload = { data: { dbs: ["all"] } };
        const headers = this.headers(apiKey);
        
        const proxyAgent = new HttpsProxyAgent(proxy);
        const response = await axios.post(url, payload, { 
            headers, 
            httpsAgent: proxyAgent 
        });
        return response.data;
    }

    async improveSkill(apiKey, skillKey, proxy) {
        const url = "https://api.muskempire.io/skills/improve";
        const payload = { data: skillKey };
        const headers = this.headers(apiKey);
        
        const proxyAgent = new HttpsProxyAgent(proxy);
        const response = await axios.post(url, payload, { 
            headers, 
            httpsAgent: proxyAgent 
        });
        return response.data;
    }

    async guiTap(apiKey, amount, currentEnergy, proxy) {
        const url = "https://api.muskempire.io/hero/action/tap";
        const seconds = Math.floor(Math.random() * (900 - 500 + 1)) + 500; 
        const payload = {
            data: {
                data: {
                    task: {
                        amount: amount,
                        currentEnergy: currentEnergy
                    }
                },
                seconds: seconds
            }
        };
        const headers = this.headers(apiKey);
        
        const proxyAgent = new HttpsProxyAgent(proxy);
        const response = await axios.post(url, payload, { 
            headers, 
            httpsAgent: proxyAgent 
        });
        return response.data;
    }

    async checkProxyIP(proxy) {
        try {
            const proxyAgent = new HttpsProxyAgent(proxy);
            const response = await axios.get('https://api.ipify.org?format=json', {
                httpsAgent: proxyAgent
            });
            if (response.status === 200) {
                return response.data.ip;
            } else {
                throw new Error(`Không thể kiểm tra IP của proxy. Status code: ${response.status}`);
            }
        } catch (error) {
            throw new Error(`Error khi kiểm tra IP của proxy: ${error.message}`);
        }
    }

    askQuestion(query) {
        const rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout
        });

        return new Promise(resolve => rl.question(query, ans => {
            rl.close();
            resolve(ans);
        }));
    }

    log(msg) {
        console.log(`[*] ${msg}`);
    }

    async waitWithCountdown(seconds) {
        for (let i = seconds; i >= 0; i--) {
            readline.cursorTo(process.stdout, 0);
            process.stdout.write(`===== Đã hoàn thành tất cả tài khoản, chờ ${i} giây để tiếp tục vòng lặp =====`);
            await new Promise(resolve => setTimeout(resolve, 1000));
        }
        console.log('');
    }

    async main() {
        const dataFile = path.join(__dirname, 'data.txt');
        const proxyFile = path.join(__dirname, 'proxy.txt');
        
        const initDataList = fs.readFileSync(dataFile, 'utf8')
            .replace(/\r/g, '')
            .split('\n')
            .filter(Boolean);
        
        const proxyList = fs.readFileSync(proxyFile, 'utf8')
            .replace(/\r/g, '')
            .split('\n')
            .filter(Boolean);
        
        console.log('Tool được chia sẻ miễn phí tại kênh telegram Dân Cày Airdrop @dancayairdrop !')
        const nangcap = await this.askQuestion('Bạn có muốn nâng cấp kỹ năng không? (y/n): ');
        const hoinangcap = nangcap.toLowerCase() === 'y';

        while (true) {
            for (let no = 0; no < initDataList.length; no++) {
                const initData = initDataList[no];
                const proxy = proxyList[no];
                try {
                    const authResponse = await this.auth(initData, proxy);
                    if (authResponse.success) {
                        const apiKey = initData.match(/hash=([^&]*)/)[1];
                        const userData = await this.getUserData(apiKey, proxy);
                        const firstName = userData.data.profile.firstName;
                        
                        const proxyIP = await this.checkProxyIP(proxy);
                        console.log(`========== Tài khoản ${no + 1} | ${firstName} | IP: ${proxyIP} ==========`);
                        
                        const heroData = userData.data.hero;
                        let money = userData.data.hero.money;
                        const { level, exp, pvpWin, pvpLose } = heroData;
                        const energy = heroData.earns.task.energy;
    
                        this.log(`Balance: ${money}`);
                        this.log(`Level: ${level}`);
                        this.log(`EXP: ${exp}`);
                        this.log(`Energy: ${energy}`);
                        this.log(`PvP Wins: ${pvpWin}`);
                        this.log(`PvP Losses: ${pvpLose}`);
    
                        const dailyRewards = userData.data.dailyRewards;
                        for (const [rewardId, status] of Object.entries(dailyRewards)) {
                            if (status === 'canTake') {
                                const claimResponse = await this.claimDailyReward(apiKey, rewardId, proxy);
                                if (claimResponse.success) {
                                    this.log(`Điểm danh thành công ngày ${rewardId}`);
                                } else {
                                    this.log(`Điểm danh thất bại ngày ${rewardId}`);
                                }
                            }
                        }
                        
                        const actionResponse = await this.guiTap(apiKey, energy, 0, proxy);
                        if (actionResponse.success) {
                            this.log('Tap thành công!');
                            const heroData = actionResponse.data.hero;
                            this.log(`Balance: ${heroData.money}`);
                        } else {
                            this.log('Tap thất bại!');
                        }     

                        if (hoinangcap) {
                            const dbSkillsResponse = await this.getDB(apiKey, proxy);
                            if (dbSkillsResponse.success) {
                                for (const skill of dbSkillsResponse.data.dbSkills) {
                                    while (money > skill.priceBasic) {
                                        const improveResponse = await this.improveSkill(apiKey, skill.key, proxy);
                                        if (improveResponse.success) {
                                            this.log(`Nâng cấp kỹ năng ${skill.title} thành công!`);
                                            money = improveResponse.data.hero.money;
                                        } else {
                                            this.log(`Nâng cấp kỹ năng ${skill.title} thất bại!`);
                                            break;
                                        }
                                    }
                                }
                            }
                        }                   
    
                    } else {
                        console.log('Đăng nhập thất bại!');
                    }
                } catch (error) {
                    this.log('Lỗi khi kết nối tới API!');
                    console.error(error);
                }
            }
            await this.waitWithCountdown(Math.floor(60));
        }
    }    
}

if (require.main === module) {
    const muskEmpireAPI = new MuskEmpireAPI();
    muskEmpireAPI.main().catch(err => {
        console.error(err);
        process.exit(1);
    });
}