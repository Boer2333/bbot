import axios from 'axios';
import { HttpsProxyAgent } from 'https-proxy-agent';
import { SocksProxyAgent } from 'socks-proxy-agent';

// 创建统一的请求配置
class RequestManager {
  constructor(proxy = null, userAgent = null) {
    this.proxy = proxy;
    this.maxRetries = 3; 
    console.log('🌐 :', proxy ? `使用代理` : '不使用代理')
    if (userAgent) {
      const chromeVersion = userAgent.match(/Chrome\/(\d+)/)[1];
      this.baseHeaders = {
        'Accept': 'application/json, text/plain, */*',
        'Content-Type': 'application/json',
        'Sec-Ch-Ua': `"Google Chrome";v="${chromeVersion}", "Not=A?Brand";v="8", "Chromium";v="${chromeVersion}"`,
        'Sec-Ch-Ua-Mobile': '?0',
        'User-Agent': userAgent,
        'Accept-Language': getRandomAcceptLanguage()
      };
    } else {
      // 如果没传入，使用随机生成的 headers
      this.baseHeaders = generateRandomHeaders();
    }
    this.axiosInstance = this.createAxiosInstance();
  }
  createAxiosInstance() {
    let agent = null;
    
    if (this.proxy) {
      try {
        // 检查是否是 socks 代理
        if (this.proxy.startsWith('socks')) {
          agent = new SocksProxyAgent(this.proxy);
        } else {
          agent = new HttpsProxyAgent(this.proxy);
        }
      } catch (error) {
        throw error;
      }
    }
    
    return axios.create({
      agent: agent,
      headers: this.baseHeaders,
      timeout: 30000
    });
  }

  async request(config) {
    let retries = this.maxRetries;
    let lastError;

    while (retries > 0) {
        try {
            const mergedConfig = {
              ...config,
              headers: {
                  ...this.baseHeaders,
                  ...config.headers
              }
            };
            const response = await this.axiosInstance(mergedConfig);
            return response.data;
        } catch (error) {
            lastError = error;
            retries--;
            
            if (retries > 0) {
                console.log(`请求失败，剩余重试次数: ${retries}`);
                // 重试延迟 1-2 秒
                await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 1000));
                continue;
            }

            throw error;  
        }
    }
  }
  setMaxRetries(retries) {
    this.maxRetries = retries;
  }
}
function createProxyAxios(proxy = null) {
  let httpsAgent = null;
  let httpAgent = null;

  if (proxy) {
      try {
          console.log(`🌐 配置代理`);
          if (proxy.startsWith('socks')) {
              const agent = new SocksProxyAgent(proxy);
              httpsAgent = agent;
              httpAgent = agent;
          } else {
              httpsAgent = new HttpsProxyAgent(proxy);
              httpAgent = new HttpsProxyAgent(proxy);
          }
      } catch (error) {
          console.error('❌ 代理配置失败:', error);
          throw error;
      }
  }
  
  // 创建全局 axios 实例
  const axiosInstance = axios.create({
      timeout: 30000,
      httpAgent: httpAgent,      // HTTP 代理
      httpsAgent: httpsAgent,    // HTTPS 代理
      proxy: false,              // 禁用默认代理配置
      maxRedirects: 5      // 最大重定向次数
  });

  return axiosInstance;
}

function getRandomChromeVersion() {
  return Math.floor(Math.random() * (131 - 128 + 1) + 128).toString();
}

function getRandomValue(array) {
  return array[Math.floor(Math.random() * array.length)];
}

function getRandomUserAgent() {
  const systems = [
      'Windows NT 10.0; Win64; x64',
      'Windows NT 11.0; Win64; x64',
      'Macintosh; Apple M1 Mac OS X 14_0',
      'Macintosh; Apple M1 Mac OS X 14_1',
      'Macintosh; Apple M2 Mac OS X 14_2',
      'Macintosh; Apple M2 Mac OS X 14_3',
      'Macintosh; Apple M3 Mac OS X 14_4'
  ];
  const system = getRandomValue(systems);
  const chromeVersion = getRandomChromeVersion();
  
  if (system.includes('Windows')) {
      return `Mozilla/5.0 (${system}) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/${chromeVersion}.0.0.0 Safari/537.36`;
  } else {
      const subVersion = Math.floor(Math.random() * 100);
      return `Mozilla/5.0 (${system}) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/${chromeVersion}.0.${subVersion}.0 Safari/537.36`;
  }
}

function getRandomAcceptLanguage() {
  const languages = [
    'en-US,en;q=0.9',
    'en-GB,en;q=0.8',
    'zh-CN,zh;q=0.9,en;q=0.8',
    'fr-FR,fr;q=0.9,en-US;q=0.8,en;q=0.7',
    'zh-CN,zh;q=0.9,en;q=0.8,en-GB;q=0.7,en-US;q=0.6'
  ];
  return languages[Math.floor(Math.random() * languages.length)];
}

function generateRandomHeaders() {
  const chromeVersion = getRandomChromeVersion();
  const userAgent = getRandomUserAgent(chromeVersion);
  const acceptLanguage = getRandomAcceptLanguage();

  const headers = {
    'Accept': 'application/json, text/plain, */*',
    'Content-Type': 'application/json',
    'Sec-Ch-Ua': `"Google Chrome";v="${chromeVersion}", "Not=A?Brand";v="8", "Chromium";v="${chromeVersion}"`,
    'Sec-Ch-Ua-Mobile': '?0',
    'User-Agent': userAgent,
    'Accept-Language': acceptLanguage
  };

  if (Math.random() > 0.5) {
    headers['Sec-Fetch-Site'] = 'cross-site';
    headers['Sec-Fetch-Mode'] = 'cors';
    headers['Sec-Fetch-Dest'] = 'empty';
  }

  if (Math.random() > 0.7) {
    headers['Sec-Ch-Ua-Platform'] = getRandomValue(['"Windows"', '"macOS"']);
  }

  return headers;
}

export {
  RequestManager,
  createProxyAxios,
  generateRandomHeaders,
  getRandomUserAgent,
  getRandomChromeVersion,
  getRandomAcceptLanguage
};
