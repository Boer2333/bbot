import axios from 'axios';
import { HttpsProxyAgent } from 'https-proxy-agent';
import { SocksProxyAgent } from 'socks-proxy-agent';

// 创建统一的请求配置
class RequestManager {
  constructor(proxy = null) {
    this.proxy = proxy;
    console.log('🌐 :', proxy ? `使用代理` : '不使用代理')
    this.baseHeaders = this.generateBaseHeaders();
    this.axiosInstance = this.createAxiosInstance();
  }

  generateBaseHeaders() {
    const chromeVersion = this.getRandomChromeVersion();
    const userAgent = this.getRandomUserAgent(chromeVersion);
    const acceptLanguage = this.getRandomAcceptLanguage();

    
    const headers = {
      'Accept': 'application/json, text/plain, */*',
      'Content-Type': 'application/json',
      'Sec-Ch-Ua': `"Google Chrome";v="${chromeVersion}", "Not=A?Brand";v="8", "Chromium";v="${chromeVersion}"`,
      'Sec-Ch-Ua-Mobile': '?0',
      'User-Agent': userAgent,
      'Accept-Language': acceptLanguage
    };

    if (Math.random() > 0.5) {
      headers['Sec-Fetch-Site'] = ['same-origin', 'same-site', 'cross-site'][Math.floor(Math.random() * 3)];
      headers['Sec-Fetch-Mode'] = ['cors', 'navigate', 'no-cors'][Math.floor(Math.random() * 3)];
      headers['Sec-Fetch-Dest'] = ['empty', 'document', 'script'][Math.floor(Math.random() * 3)];
    }

    if (Math.random() > 0.7) {
      headers['Sec-Ch-Ua-Platform'] = ['"Windows"', '"macOS"'][Math.floor(Math.random() * 2)];
    }

    return headers;
  }

  getRandomChromeVersion() {
    return Math.floor(Math.random() * (129 - 122 + 1) + 122).toString();
  }

  getRandomUserAgent(chromeVersion) {
    const systems = [
        // Windows 11 和 10 的配置
        'Windows NT 10.0; Win64; x64',
        'Windows NT 11.0; Win64; x64',
        // Apple Silicon Mac
        'Macintosh; Apple M1 Mac OS X 14_0',
        'Macintosh; Apple M1 Mac OS X 14_1',
        'Macintosh; Apple M2 Mac OS X 14_2',
        'Macintosh; Apple M2 Mac OS X 14_3',
        'Macintosh; Apple M3 Mac OS X 14_4'
    ];
    const system = this.getRandomValue(systems);
    
    // 针对不同系统生成稍微不同的User-Agent
    if (system.includes('Windows')) {
        return `Mozilla/5.0 (${system}) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/${chromeVersion}.0.0.0 Safari/537.36`;
    } else {
        // macOS的Chrome版本号格式略有不同，可能包含子版本号
        const subVersion = Math.floor(Math.random() * 100);
        return `Mozilla/5.0 (${system}) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/${chromeVersion}.0.${subVersion}.0 Safari/537.36`;
    }
  }
  getRandomValue(array) {
    return array[Math.floor(Math.random() * array.length)];
  }

  getRandomAcceptLanguage() {
    const languages = [
      'en-US,en;q=0.9',
      'en-GB,en;q=0.8',
      'zh-CN,zh;q=0.9,en;q=0.8',
      'fr-FR,fr;q=0.9,en-US;q=0.8,en;q=0.7',
      'zh-CN,zh;q=0.9,en;q=0.8,en-GB;q=0.7,en-US;q=0.6'
    ];
    return languages[Math.floor(Math.random() * languages.length)];
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
    let retries = 3;
    let lastError;

    while (retries > 0) {
        try {
            const response = await this.axiosInstance(config);
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

            if (error.response) {
                return error.response.data;
            }
            throw error;
        }
    }

    throw lastError;
  }
}
function createProxyAxios(proxy = null) {
  let agent = null;
  
  if (proxy) {
      try {
          console.log(`🌐 配置代理`);
          if (proxy.startsWith('socks')) {
              agent = new SocksProxyAgent(proxy);
          } else {
              agent = new HttpsProxyAgent(proxy);
          }
      } catch (error) {
          console.error('❌ 代理配置失败:', error);
          throw error;
      }
  }
  
  // 创建全局 axios 实例
  const axiosInstance = axios.create({
      agent: agent,
      timeout: 30000
  });

  return axiosInstance;
}

function getRandomChromeVersion() {
  return Math.floor(Math.random() * (129 - 122 + 1) + 122).toString();
}

function getRandomValue(array) {
  return array[Math.floor(Math.random() * array.length)];
}

function getRandomUserAgent(chromeVersion) {
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
    headers['Sec-Fetch-Site'] = getRandomValue(['same-origin', 'same-site', 'cross-site']);
    headers['Sec-Fetch-Mode'] = getRandomValue(['cors', 'navigate', 'no-cors']);
    headers['Sec-Fetch-Dest'] = getRandomValue(['empty', 'document', 'script']);
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