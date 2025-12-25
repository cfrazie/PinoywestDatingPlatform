import { supabase } from '../lib/supabase';
import type {
  CultureWallPost,
  CultureWallComment,
  CultureWallReaction,
  CultureWallHashtag,
  CreatePostRequest,
  CreateCommentRequest,
  CreateReactionRequest,
  ReportContentRequest,
} from '../types/cultureWall';

// Posts
export const cultureWallService = {
  // Fetch posts with pagination
  async getPosts(options: {
    limit?: number;
    offset?: number;
    category?: string;
    visibility?: string;
    userId?: string;
  } = {}) {
    const { limit = 20, offset = 0, category, visibility = 'public', userId } = options;
    
    let query = supabase
      .from('culture_wall_posts')
      .select('*')
      .eq('moderation_status', 'approved')
      .is('deleted_at', null)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (category) {
      query = query.eq('category', category);
    }

    if (visibility) {
      query = query.eq('visibility', visibility);
    }

    if (userId) {
      query = query.eq('user_id', userId);
    }

    const { data, error } = await query;

    if (error) throw error;
    return data as CultureWallPost[];
  },

  // Get single post
  async getPost(postId: string) {
    const { data, error } = await supabase
      .from('culture_wall_posts')
      .select('*')
      .eq('id', postId)
      .single();

    if (error) throw error;
    return data as CultureWallPost;
  },

  // Create post
  async createPost(post: CreatePostRequest) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('culture_wall_posts')
      .insert({
        user_id: user.id,
        ...post,
      })
      .select()
      .single();

    if (error) throw error;
    return data as CultureWallPost;
  },

  // Update post
  async updatePost(postId: string, updates: Partial<CreatePostRequest>) {
    const { data, error } = await supabase
      .from('culture_wall_posts')
      .update(updates)
      .eq('id', postId)
      .select()
      .single();

    if (error) throw error;
    return data as CultureWallPost;
  },

  // Delete post (soft delete)
  async deletePost(postId: string) {
    const { error } = await supabase
      .from('culture_wall_posts')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', postId);

    if (error) throw error;
  },

  // Increment view count
  async incrementViewCount(postId: string) {
    const { error } = await supabase.rpc('increment_post_views', {
      post_id: postId,
    });

    if (error) console.error('Error incrementing view count:', error);
  },

  // Comments
  async getComments(postId: string, options: { limit?: number; offset?: number } = {}) {
    const { limit = 50, offset = 0 } = options;

    const { data, error } = await supabase
      .from('culture_wall_comments')
      .select('*')
      .eq('post_id', postId)
      .is('deleted_at', null)
      .order('created_at', { ascending: true })
      .range(offset, offset + limit - 1);

    if (error) throw error;
    return data as CultureWallComment[];
  },

  async createComment(comment: CreateCommentRequest) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('culture_wall_comments')
      .insert({
        user_id: user.id,
        ...comment,
      })
      .select()
      .single();

    if (error) throw error;
    return data as CultureWallComment;
  },

  async deleteComment(commentId: string) {
    const { error } = await supabase
      .from('culture_wall_comments')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', commentId);

    if (error) throw error;
  },

  // Reactions
  async getReactions(postId?: string, commentId?: string) {
    let query = supabase
      .from('culture_wall_reactions')
      .select('*');

    if (postId) {
      query = query.eq('post_id', postId);
    }

    if (commentId) {
      query = query.eq('comment_id', commentId);
    }

    const { data, error } = await query;

    if (error) throw error;
    return data as CultureWallReaction[];
  },

  async addReaction(reaction: CreateReactionRequest) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('culture_wall_reactions')
      .insert({
        user_id: user.id,
        ...reaction,
      })
      .select()
      .single();

    if (error) throw error;
    return data as CultureWallReaction;
  },

  async removeReaction(reactionId: string) {
    const { error } = await supabase
      .from('culture_wall_reactions')
      .delete()
      .eq('id', reactionId);

    if (error) throw error;
  },

  // Hashtags
  async getTrendingHashtags(limit = 10) {
    const { data, error } = await supabase
      .from('culture_wall_hashtags')
      .select('*')
      .order('usage_count', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data as CultureWallHashtag[];
  },

  async searchHashtags(query: string, limit = 10) {
    const { data, error } = await supabase
      .from('culture_wall_hashtags')
      .select('*')
      .ilike('tag', `%${query}%`)
      .order('usage_count', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data as CultureWallHashtag[];
  },

  // Saved posts
  async savePost(postId: string, collectionName?: string) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { error } = await supabase
      .from('culture_wall_saved_posts')
      .insert({
        user_id: user.id,
        post_id: postId,
        collection_name: collectionName,
      });

    if (error) throw error;
  },

  async unsavePost(postId: string) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { error } = await supabase
      .from('culture_wall_saved_posts')
      .delete()
      .eq('user_id', user.id)
      .eq('post_id', postId);

    if (error) throw error;
  },

  async getSavedPosts(options: { limit?: number; offset?: number } = {}) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { limit = 20, offset = 0 } = options;

    const { data, error } = await supabase
      .from('culture_wall_saved_posts')
      .select('*, culture_wall_posts(*)')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) throw error;
    return data;
  },

  // Share post
  async sharePost(postId: string, sharedTo: 'feed' | 'message' | 'external', message?: string) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { error } = await supabase
      .from('culture_wall_shares')
      .insert({
        user_id: user.id,
        post_id: postId,
        shared_to: sharedTo,
        message,
      });

    if (error) throw error;
  },

  // Report content
  async reportContent(report: ReportContentRequest) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { error } = await supabase
      .from('culture_wall_reports')
      .insert({
        reporter_id: user.id,
        ...report,
      });

    if (error) throw error;
  },

  // Subscribe to real-time updates
  subscribeToPostUpdates(callback: (payload: any) => void) {
    return supabase
      .channel('culture_wall_posts_changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'culture_wall_posts',
      }, callback)
      .subscribe();
  },

  subscribeToCommentUpdates(postId: string, callback: (payload: any) => void) {
    return supabase
      .channel(`comments_${postId}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'culture_wall_comments',
        filter: `post_id=eq.${postId}`,
      }, callback)
      .subscribe();
  },
};
