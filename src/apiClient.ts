class ApiClient {
  private static instance: ApiClient;
  private baseUrl: string;

  private constructor() {
    this.baseUrl = process.env.REACT_APP_API_URL || '';
  }

  public static getInstance(): ApiClient {
    if (!ApiClient.instance) {
      ApiClient.instance = new ApiClient();
    }
    return ApiClient.instance;
  }

  private async request<T>(
    endpoint: string,
    method: string,
    body?: any,
    headers: HeadersInit = {}
  ): Promise<{ data?: T; error?: string }> {
    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`, // Lisää Authorization-otsikko
          ...headers,
        },
        credentials: 'include',
        body: body ? JSON.stringify(body) : undefined,
      });

      if (!response.ok) {
        if (response.status === 401) {
          // Käsittele 401 Unauthorized -virhe
          return { error: 'Unauthorized. Please log in again.' };
        }

        const errorText = await response.text();
        let errorMessage;
        try {
          const errorData = JSON.parse(errorText);
          errorMessage = errorData.error;
        } catch {
          errorMessage = errorText || 'An error occurred';
        }
        return { error: errorMessage };
      }

      const data = await response.json();
      return { data };
    } catch (error) {
      return { error: error instanceof Error ? error.message : 'Network error' };
    }
  }

  public async get<T>(endpoint: string, params?: Record<string, string>): Promise<{ data?: T; error?: string }> {
    const queryString = params ? '?' + new URLSearchParams(params).toString() : '';
    return this.request<T>(`${endpoint}${queryString}`, 'GET');
  }

  public async post<T>(endpoint: string, body?: any): Promise<{ data?: T; error?: string }> {
    return this.request<T>(endpoint, 'POST', body);
  }

  public async put<T>(endpoint: string, body?: any): Promise<{ data?: T; error?: string }> {
    return this.request<T>(endpoint, 'PUT', body);
  }

  public async delete<T>(endpoint: string): Promise<{ data?: T; error?: string }> {
    return this.request<T>(endpoint, 'DELETE');
  }

  public async upload<T>(endpoint: string, formData: FormData): Promise<{ data?: T; error?: string }> {
    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`, // Lisää Authorization-otsikko
        },
        body: formData,
      });

      if (!response.ok) {
        if (response.status === 401) {
          // Käsittele 401 Unauthorized -virhe
          return { error: 'Unauthorized. Please log in again.' };
        }

        const errorText = await response.text();
        let errorMessage;
        try {
          const errorData = JSON.parse(errorText);
          errorMessage = errorData.error;
        } catch {
          errorMessage = errorText || 'An error occurred';
        }
        return { error: errorMessage };
      }

      const data = await response.json();
      return { data };
    } catch (error) {
      return { error: error instanceof Error ? error.message : 'Network error' };
    }
  }
}

export default ApiClient.getInstance();
