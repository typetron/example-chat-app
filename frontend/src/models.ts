export type BackendError =
    string |
    {
        message: string,
        status: 'error'
        stack: string[],
    } |
    {
        message: Record<string, Record<string, string>>,
        stack: string[],
        status: 'error'
    }
