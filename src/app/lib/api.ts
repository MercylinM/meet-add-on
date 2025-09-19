class ApiClient {
  private baseURL: string;
  private headers: Record<string, string>;

  constructor() {
    this.baseURL = `${process.env.RECOS_API_BASE}`;
    this.headers = {
      'Content-Type': 'application/json',
      'Authorization': `Token ${process.env.RECOS_API_TOKEN}`,
    };
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    const response = await fetch(url, {
      headers: this.headers,
      ...options,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      throw new Error(`API Error: ${response.status} - ${errorData?.message || 'Unknown error'}`);
    }

    return response.json();
  }

  async get<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'GET' });
  }

  async post<T>(endpoint: string, data: unknown): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }
}

export const apiClient = new ApiClient();

export const getInterviewDetails = async (interviewId: string) => {
  return apiClient.get(`/interviews/${interviewId}/`);
};

export const sendTranscriptForAnalysis = async (interviewId: string, transcript: string) => {
  const payload = {
    interview_id: interviewId,
    transcript,
    chunk_number: Date.now(),
    transcript_time: new Date().toISOString(),
  };

  return apiClient.post('/recos/analysis/', payload);
};

export const getConversationHistory = async (interviewId: string) => {
  return apiClient.get(`/interviews/${interviewId}/conversations/`);
};