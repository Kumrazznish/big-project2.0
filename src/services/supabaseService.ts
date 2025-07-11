import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface RoadmapData {
  id: string;
  user_id: string;
  subject: string;
  difficulty: string;
  roadmap_data: any;
  created_at: string;
  updated_at: string;
}

export interface DetailedCourseData {
  id: string;
  user_id: string;
  roadmap_id: string;
  course_data: any;
  created_at: string;
  updated_at: string;
}

class SupabaseService {
  // Save roadmap to database
  async saveRoadmap(userId: string, subject: string, difficulty: string, roadmapData: any): Promise<RoadmapData> {
    const { data, error } = await supabase
      .from('roadmaps')
      .insert({
        user_id: userId,
        subject,
        difficulty,
        roadmap_data: roadmapData,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) {
      console.error('Error saving roadmap:', error);
      throw error;
    }

    return data;
  }

  // Save detailed course to database
  async saveDetailedCourse(userId: string, roadmapId: string, courseData: any): Promise<DetailedCourseData> {
    const { data, error } = await supabase
      .from('detailed_courses')
      .insert({
        user_id: userId,
        roadmap_id: roadmapId,
        course_data: courseData,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) {
      console.error('Error saving detailed course:', error);
      throw error;
    }

    return data;
  }

  // Get user's roadmaps
  async getUserRoadmaps(userId: string): Promise<RoadmapData[]> {
    const { data, error } = await supabase
      .from('roadmaps')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching roadmaps:', error);
      throw error;
    }

    return data || [];
  }

  // Get detailed course by roadmap ID
  async getDetailedCourse(roadmapId: string): Promise<DetailedCourseData | null> {
    const { data, error } = await supabase
      .from('detailed_courses')
      .select('*')
      .eq('roadmap_id', roadmapId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        // No detailed course found
        return null;
      }
      console.error('Error fetching detailed course:', error);
      throw error;
    }

    return data;
  }

  // Get user's detailed courses
  async getUserDetailedCourses(userId: string): Promise<DetailedCourseData[]> {
    const { data, error } = await supabase
      .from('detailed_courses')
      .select(`
        *,
        roadmaps (
          subject,
          difficulty
        )
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching detailed courses:', error);
      throw error;
    }

    return data || [];
  }

  // Update chapter progress
  async updateChapterProgress(roadmapId: string, chapterId: string, completed: boolean): Promise<void> {
    // First get the current roadmap data
    const { data: roadmap, error: fetchError } = await supabase
      .from('roadmaps')
      .select('roadmap_data')
      .eq('id', roadmapId)
      .single();

    if (fetchError) {
      console.error('Error fetching roadmap for progress update:', fetchError);
      throw fetchError;
    }

    // Update the chapter progress in the roadmap data
    const updatedRoadmapData = { ...roadmap.roadmap_data };
    if (updatedRoadmapData.chapters) {
      updatedRoadmapData.chapters = updatedRoadmapData.chapters.map((chapter: any) =>
        chapter.id === chapterId ? { ...chapter, completed } : chapter
      );
    }

    // Save the updated roadmap data
    const { error: updateError } = await supabase
      .from('roadmaps')
      .update({
        roadmap_data: updatedRoadmapData,
        updated_at: new Date().toISOString()
      })
      .eq('id', roadmapId);

    if (updateError) {
      console.error('Error updating chapter progress:', updateError);
      throw updateError;
    }
  }

  // Delete roadmap and its detailed course
  async deleteRoadmap(roadmapId: string): Promise<void> {
    // Delete detailed course first (if exists)
    await supabase
      .from('detailed_courses')
      .delete()
      .eq('roadmap_id', roadmapId);

    // Delete roadmap
    const { error } = await supabase
      .from('roadmaps')
      .delete()
      .eq('id', roadmapId);

    if (error) {
      console.error('Error deleting roadmap:', error);
      throw error;
    }
  }
}

export const supabaseService = new SupabaseService();