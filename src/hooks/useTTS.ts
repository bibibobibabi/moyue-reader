import { useCallback, useRef, useEffect, useState } from 'react';
import { useReaderStore } from '@/stores/readerStore';
import CryptoJS from 'crypto-js';

interface TTSState {
  isSpeaking: boolean;
  currentText: string;
  progress: number;
  error: string | null;
}

// 讯飞WebSocket TTS
class XunfeiTTS {
  private ws: WebSocket | null = null;
  private audioChunks: string[] = [];
  private audioContext: AudioContext | null = null;
  private sourceNode: AudioBufferSourceNode | null = null;
  private gainNode: GainNode | null = null;
  private appId: string;
  private apiKey: string;
  private apiSecret: string;
  private onAudioData: (data: string) => void;
  private onComplete: () => void;
  private onError: (err: string) => void;

  constructor(
    appId: string,
    apiKey: string,
    apiSecret: string,
    onAudioData: (data: string) => void,
    onComplete: () => void,
    onError: (err: string) => void
  ) {
    this.appId = appId;
    this.apiKey = apiKey;
    this.apiSecret = apiSecret;
    this.onAudioData = onAudioData;
    this.onComplete = onComplete;
    this.onError = onError;
  }

  private getAuthUrl(): string {
    const url = 'wss://tts-api.xfyun.cn/v2/tts';
    const host = 'tts-api.xfyun.cn';
    const date = new Date().toUTCString();
    const signatureOrigin = `host: ${host}
date: ${date}
GET /v2/tts HTTP/1.1`;
    const signature = CryptoJS.HmacSHA256(signatureOrigin, this.apiSecret).toString(CryptoJS.enc.Base64);
    const authorizationOrigin = `api_key="${this.apiKey}", algorithm="hmac-sha256", headers="host date request-line", signature="${signature}"`;
    const authorization = btoa(authorizationOrigin);
    return `${url}?authorization=${authorization}&date=${encodeURIComponent(date)}&host=${host}`;
  }

  async speak(text: string, voice: string, rate: number, pitch: number, volume: number) {
    try {
      const wsUrl = this.getAuthUrl();
      this.ws = new WebSocket(wsUrl);

      this.ws.onopen = () => {
        const frame = {
          common: { app_id: this.appId },
          business: {
            aue: 'lame',
            sfl: 1,
            auf: 'audio/L16;rate=16000',
            vcn: voice || 'xiaoyan',
            speed: Math.round(rate * 50),
            volume: Math.round(volume * 50),
            pitch: Math.round(pitch * 50),
            bgs: 0,
            tte: 'UTF8',
          },
          data: {
            status: 2,
            text: btoa(unescape(encodeURIComponent(text))),
          },
        };
        this.ws?.send(JSON.stringify(frame));
      };

      this.ws.onmessage = (event) => {
        const response = JSON.parse(event.data);
        if (response.code !== 0) {
          this.onError(response.message || '讯飞TTS错误');
          return;
        }
        if (response.data && response.data.audio) {
          this.audioChunks.push(response.data.audio);
          this.onAudioData(response.data.audio);
        }
        if (response.data && response.data.status === 2) {
          this.onComplete();
        }
      };

      this.ws.onerror = () => this.onError('WebSocket连接错误');
      this.ws.onclose = () => {
        if (this.audioChunks.length === 0) {
          this.onError('连接已关闭');
        }
      };
    } catch (err) {
      this.onError(String(err));
    }
  }

  stop() {
    this.ws?.close();
    this.ws = null;
    this.audioChunks = [];
    this.sourceNode?.stop();
    this.sourceNode = null;
  }
}

export function useTTS() {
  const ttsConfig = useReaderStore((s) => s.ttsConfig);
  const setIsSpeaking = useReaderStore((s) => s.setIsSpeaking);
  const [state, setState] = useState<TTSState>({
    isSpeaking: false,
    currentText: '',
    progress: 0,
    error: null,
  });

  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const xunfeiRef = useRef<XunfeiTTS | null>(null);
  const audioQueueRef = useRef<string[]>([]);
  const isPlayingRef = useRef(false);
  const audioCtxRef = useRef<AudioContext | null>(null);

  // 获取本地语音列表
  const [localVoices, setLocalVoices] = useState<SpeechSynthesisVoice[]>([]);
  useEffect(() => {
    const load = () => setLocalVoices(window.speechSynthesis.getVoices());
    load();
    window.speechSynthesis.onvoiceschanged = load;
    return () => { window.speechSynthesis.onvoiceschanged = null; };
  }, []);

  const playNextAudio = useCallback(async () => {
    if (audioQueueRef.current.length === 0 || isPlayingRef.current) return;
    isPlayingRef.current = true;

    const base64 = audioQueueRef.current.shift()!;
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);

    if (!audioCtxRef.current) audioCtxRef.current = new AudioContext();

    try {
      const buffer = await audioCtxRef.current.decodeAudioData(bytes.buffer);
      const source = audioCtxRef.current.createBufferSource();
      source.buffer = buffer;
      source.connect(audioCtxRef.current.destination);
      source.onended = () => {
        isPlayingRef.current = false;
        playNextAudio();
      };
      source.start();
    } catch {
      isPlayingRef.current = false;
      playNextAudio();
    }
  }, []);

  const speak = useCallback(async (text: string, _startPosition?: number) => {
    if (!text.trim()) return;

    setState({ isSpeaking: true, currentText: text, progress: 0, error: null });
    setIsSpeaking(true);

    if (ttsConfig.engine === 'local') {
      // 本地Web Speech API
      if (window.speechSynthesis.speaking) {
        window.speechSynthesis.cancel();
      }

      const utterance = new SpeechSynthesisUtterance(text);
      const voices = window.speechSynthesis.getVoices();
      const selected = voices.find(v => v.name === ttsConfig.voice) || 
                       voices.find(v => v.lang.includes('zh')) || 
                       voices[0];
      if (selected) utterance.voice = selected;

      utterance.rate = ttsConfig.rate;
      utterance.pitch = ttsConfig.pitch;
      utterance.volume = ttsConfig.volume;
      utterance.lang = 'zh-CN';

      utterance.onboundary = (e) => {
        setState(s => ({ ...s, progress: e.charIndex / text.length }));
      };
      utterance.onend = () => {
        setState(s => ({ ...s, isSpeaking: false, progress: 1 }));
        setIsSpeaking(false);
      };
      utterance.onerror = (e) => {
        setState(s => ({ ...s, isSpeaking: false, error: e.error }));
        setIsSpeaking(false);
      };

      utteranceRef.current = utterance;
      window.speechSynthesis.speak(utterance);

    } else if (ttsConfig.engine === 'xunfei') {
      // 讯飞云端TTS
      if (!ttsConfig.xunfeiAppId || !ttsConfig.xunfeiApiKey || !ttsConfig.xunfeiApiSecret) {
        setState(s => ({ ...s, isSpeaking: false, error: '请先配置讯飞API密钥' }));
        setIsSpeaking(false);
        return;
      }

      audioQueueRef.current = [];
      isPlayingRef.current = false;

      xunfeiRef.current = new XunfeiTTS(
        ttsConfig.xunfeiAppId,
        ttsConfig.xunfeiApiKey,
        ttsConfig.xunfeiApiSecret,
        (data) => {
          audioQueueRef.current.push(data);
          playNextAudio();
        },
        () => {
          setState(s => ({ ...s, isSpeaking: false, progress: 1 }));
          setIsSpeaking(false);
        },
        (err) => {
          setState(s => ({ ...s, isSpeaking: false, error: err }));
          setIsSpeaking(false);
        }
      );

      await xunfeiRef.current.speak(
        text,
        ttsConfig.voice,
        ttsConfig.rate,
        ttsConfig.pitch,
        ttsConfig.volume
      );
    }
  }, [ttsConfig, setIsSpeaking, playNextAudio]);

  const stop = useCallback(() => {
    if (ttsConfig.engine === 'local') {
      window.speechSynthesis.cancel();
    } else if (ttsConfig.engine === 'xunfei') {
      xunfeiRef.current?.stop();
      audioCtxRef.current?.close();
      audioCtxRef.current = null;
    }
    setState(s => ({ ...s, isSpeaking: false }));
    setIsSpeaking(false);
  }, [ttsConfig.engine, setIsSpeaking]);

  const pause = useCallback(() => {
    if (ttsConfig.engine === 'local') {
      window.speechSynthesis.pause();
    }
  }, [ttsConfig.engine]);

  const resume = useCallback(() => {
    if (ttsConfig.engine === 'local') {
      window.speechSynthesis.resume();
    }
  }, [ttsConfig.engine]);

  return {
    ...state,
    localVoices,
    speak,
    stop,
    pause,
    resume,
  };
}
