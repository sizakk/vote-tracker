import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Database types
export interface Database {
    public: {
        Tables: {
            employees: {
                Row: {
                    id: number
                    employee_id: string
                    category: string | null
                    major_org: string | null
                    organization: string | null
                    name: string | null
                    grade: string | null
                    grade_year: number | null
                    position: string | null
                    years_of_service: number | null
                    hiring_type: string | null
                    gender: string | null
                    age: number | null
                    is_implemented: boolean
                    implemented_date: string | null
                    agreement_status: string | null
                    is_confirmed: boolean
                    confirmed_date: string | null
                    final_agreement: string | null
                    upload_batch_id: string | null
                    created_at: string
                }
                Insert: {
                    id?: number
                    employee_id: string
                    category?: string | null
                    major_org?: string | null
                    organization?: string | null
                    name?: string | null
                    grade?: string | null
                    grade_year?: number | null
                    position?: string | null
                    years_of_service?: number | null
                    hiring_type?: string | null
                    gender?: string | null
                    age?: number | null
                    is_implemented?: boolean
                    implemented_date?: string | null
                    agreement_status?: string | null
                    is_confirmed?: boolean
                    confirmed_date?: string | null
                    final_agreement?: string | null
                    upload_batch_id?: string | null
                    created_at?: string
                }
                Update: {
                    id?: number
                    employee_id?: string
                    category?: string | null
                    major_org?: string | null
                    organization?: string | null
                    name?: string | null
                    grade?: string | null
                    grade_year?: number | null
                    position?: string | null
                    years_of_service?: number | null
                    hiring_type?: string | null
                    gender?: string | null
                    age?: number | null
                    is_implemented?: boolean
                    implemented_date?: string | null
                    agreement_status?: string | null
                    is_confirmed?: boolean
                    confirmed_date?: string | null
                    final_agreement?: string | null
                    upload_batch_id?: string | null
                    created_at?: string
                }
            }
            allowed_users: {
                Row: {
                    employee_id: string
                    name: string | null
                    role: string
                    created_at: string
                }
                Insert: {
                    employee_id: string
                    name?: string | null
                    role?: string
                    created_at?: string
                }
                Update: {
                    employee_id?: string
                    name?: string | null
                    role?: string
                    created_at?: string
                }
            }
            upload_batches: {
                Row: {
                    id: string
                    uploaded_by: string | null
                    upload_date: string
                    total_employees: number | null
                    file_name: string | null
                    base_date: string | null
                    base_time: string | null
                }
                Insert: {
                    id?: string
                    uploaded_by?: string | null
                    upload_date?: string
                    total_employees?: number | null
                    file_name?: string | null
                    base_date?: string | null
                    base_time?: string | null
                }
                Update: {
                    id?: string
                    uploaded_by?: string | null
                    upload_date?: string
                    total_employees?: number | null
                    file_name?: string | null
                    base_date?: string | null
                    base_time?: string | null
                }
            }
            ai_analysis_cache: {
                Row: {
                    id: string
                    category: string
                    analysis: string
                    data_hash: number | null
                    created_at: string
                }
                Insert: {
                    id?: string
                    category: string
                    analysis: string
                    data_hash?: number | null
                    created_at?: string
                }
                Update: {
                    id?: string
                    category?: string
                    analysis?: string
                    data_hash?: number | null
                    created_at?: string
                }
            }
        }
        Views: {
            [_ in never]: never
        }
        Functions: {
            [_ in never]: never
        }
        Enums: {
            [_ in never]: never
        }
    }
}

export type Tables<T extends keyof Database['public']['Tables']> =
    Database['public']['Tables'][T]['Row']
export type Enums<T extends keyof Database['public']['Enums']> =
    Database['public']['Enums'][T]
