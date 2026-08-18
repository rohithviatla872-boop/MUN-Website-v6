export type DelegateStatus = 'pending' | 'confirmed' | 'withdrawn'

export interface AmbitusDelegate {
  id: string
  full_name: string
  email: string | null
  phone: string | null
  institution: string | null
  class_year: string | null
  experience: string | null
  preferred_committee_1: string | null
  preferred_committee_2: string | null
  preferred_portfolio_1: string | null
  preferred_portfolio_2: string | null
  allocated_committee: string | null
  allocated_portfolio: string | null
  status: DelegateStatus
  notes: string | null
  created_at: string
  updated_at: string
}

export interface ExternalDelegate {
  id: string
  full_name: string
  email: string | null
  phone: string | null
  institution: string | null
  accommodation_required: boolean
  experience: string | null
  preferred_committee_1: string | null
  preferred_committee_2: string | null
  preferred_portfolio_1: string | null
  preferred_portfolio_2: string | null
  allocated_committee: string | null
  allocated_portfolio: string | null
  status: DelegateStatus
  notes: string | null
  created_at: string
  updated_at: string
}

export type DelegateType = 'ambitus' | 'external'

export const COMMITTEES = [
  'UNGA',
  'UNSC',
  'AIPPM',
  'Lok Sabha',
  'Rajya Sabha',
  'International Press',
  'Continuous Crisis Committee',
  'UNHRC',
] as const

export const PORTFOLIOS = [
  'India',
  'United States of America',
  'United Kingdom',
  'Russian Federation',
  'People\'s Republic of China',
  'France',
  'Germany',
  'Brazil',
  'Japan',
  'South Africa',
  'United Arab Emirates',
  'Australia',
  'Canada',
  'Reporters',
  'Photographers',
  'Caricaturists',
] as const

export const STATUS_OPTIONS: DelegateStatus[] = ['pending', 'confirmed', 'withdrawn']
