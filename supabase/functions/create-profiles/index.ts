
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.4'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface UserData {
  email: string;
  password: string;
  full_name: string;
  avatar_url: string;
  about_me: string;
  age: number;
  current_city: string;
  move_in_city: string;
  nationality: string;
  university: string;
  relocation_status: 'active' | 'planning' | 'paused' | 'completed';
  relocation_timeframe: string;
  relocation_interests: string[];
  interests: string[];
}

// This is the same user data that's in create-demo-users
const USERS_DATA: UserData[] = [
  {
    email: 'emma.schmidt@example.com',
    password: 'Password123!',
    full_name: 'Emma Schmidt',
    avatar_url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330',
    about_me: 'Creative designer looking for art communities in Berlin. Love exploring new cities and their hidden art scenes.',
    age: 28,
    current_city: 'Munich',
    move_in_city: 'Berlin',
    nationality: 'German',
    university: 'TU Munich',
    relocation_status: 'active',
    relocation_timeframe: 'Next 3 months',
    relocation_interests: ['Accommodation tips', 'Arts scene', 'Local guides'],
    interests: ['Art', 'Design', 'Museums']
  },
  {
    email: 'luis.garcia@example.com',
    password: 'Password123!',
    full_name: 'Luis Garcia',
    avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d',
    about_me: 'Software engineer with a passion for startups. Excited to join Berlin\'s tech community and meet fellow coders.',
    age: 31,
    current_city: 'Barcelona',
    move_in_city: 'Berlin',
    nationality: 'Spanish',
    university: 'UPC Barcelona',
    relocation_status: 'active',
    relocation_timeframe: 'Next month',
    relocation_interests: ['Tech meetups', 'Coworking spaces', 'Social events'],
    interests: ['Programming', 'Startups', 'Technology']
  },
  {
    email: 'sophia.chen@example.com',
    password: 'Password123!',
    full_name: 'Sophia Chen',
    avatar_url: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80',
    about_me: 'PhD student in AI research. Looking for scientific collaborations and good coffee shops to work from in Berlin.',
    age: 26,
    current_city: 'Shanghai',
    move_in_city: 'Berlin',
    nationality: 'Chinese',
    university: 'Fudan University',
    relocation_status: 'active',
    relocation_timeframe: 'Next 3 months',
    relocation_interests: ['Academic networks', 'Accommodation tips', 'Cultural events'],
    interests: ['Research', 'AI', 'Coffee']
  },
  {
    email: 'marcus.johnson@example.com',
    password: 'Password123!',
    full_name: 'Marcus Johnson',
    avatar_url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e',
    about_me: 'Music producer relocating to Berlin for its vibrant electronic music scene. Looking to connect with local artists.',
    age: 34,
    current_city: 'London',
    move_in_city: 'Berlin',
    nationality: 'British',
    university: 'Royal College of Music',
    relocation_status: 'active',
    relocation_timeframe: 'Next month',
    relocation_interests: ['Music scene', 'Nightlife', 'Studio spaces'],
    interests: ['Electronic Music', 'DJing', 'Music Production']
  },
  {
    email: 'leila.morad@example.com',
    password: 'Password123!',
    full_name: 'Leila Morad',
    avatar_url: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2',
    about_me: 'Marketing specialist with focus on sustainability. Excited to explore Berlin\'s eco-friendly initiatives and green spaces.',
    age: 29,
    current_city: 'Cairo',
    move_in_city: 'Berlin',
    nationality: 'Egyptian',
    university: 'American University in Cairo',
    relocation_status: 'planning',
    relocation_timeframe: 'Next 6 months',
    relocation_interests: ['Sustainability groups', 'Social events', 'Professional networks'],
    interests: ['Sustainability', 'Marketing', 'Eco-friendly']
  }
];

// Handle OPTIONS requests for CORS
Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Create Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const results = [];
    const errors = [];

    // Process each user
    for (const userData of USERS_DATA) {
      try {
        console.log(`Creating user: ${userData.email}`);
        
        // Create user in auth.users
        const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
          email: userData.email,
          password: userData.password,
          email_confirm: true, // Auto-confirm email
          user_metadata: {
            full_name: userData.full_name
          }
        });

        if (authError) {
          console.error(`Error creating auth user ${userData.email}:`, authError);
          errors.push({ email: userData.email, error: authError.message });
          continue;
        }

        // User profile is automatically created by a trigger
        // Update the profile with all user data
        const { error: profileError } = await supabase
          .from('profiles')
          .update({
            full_name: userData.full_name,
            avatar_url: userData.avatar_url,
            about_me: userData.about_me,
            age: userData.age,
            current_city: userData.current_city,
            move_in_city: userData.move_in_city,
            nationality: userData.nationality,
            university: userData.university,
            relocation_status: userData.relocation_status,
            relocation_timeframe: userData.relocation_timeframe,
            relocation_interests: userData.relocation_interests
          })
          .eq('id', authUser.user.id);
          
        if (profileError) {
          console.error(`Error updating profile for ${userData.email}:`, profileError);
          errors.push({ email: userData.email, error: profileError.message });
          continue;
        }
        
        // Add user interests
        for (const interest of userData.interests) {
          const { error: interestError } = await supabase
            .from('user_interests')
            .insert({
              user_id: authUser.user.id,
              interest: interest
            });
            
          if (interestError) {
            console.error(`Error adding interest "${interest}" for ${userData.email}:`, interestError);
          }
        }
        
        console.log(`Successfully created user: ${userData.email}`);
        results.push({ email: userData.email, success: true, userId: authUser.user.id });
        
      } catch (err) {
        console.error(`Unexpected error processing user ${userData.email}:`, err);
        errors.push({ email: userData.email, error: err.message || String(err) });
      }
    }

    // Return results
    return new Response(
      JSON.stringify({ 
        message: 'Demo profiles creation completed', 
        results: results,
        errors: errors,
        success: results.length,
        failed: errors.length,
        total: USERS_DATA.length
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (err) {
    console.error('Error in create-profiles function:', err);
    return new Response(
      JSON.stringify({ error: err.message || String(err) }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
