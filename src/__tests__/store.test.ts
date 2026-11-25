import { describe, it, expect, beforeEach } from 'vitest';
import { DemoDataStore } from '../data/demoDataStore';

describe('DemoDataStore Test Suite', () => {
  let store: DemoDataStore;

  beforeEach(() => {
    store = new DemoDataStore();
    store.resetData();
  });

  describe('Project Showcase Feed', () => {
    it('loads initial project showcase posts', async () => {
      const posts = await store.getPosts();
      expect(posts.length).toBeGreaterThanOrEqual(3);
      expect(posts[0]).toHaveProperty('title');
      expect(posts[0]).toHaveProperty('upvotes');
    });

    it('creates a new project showcase post', async () => {
      const created = await store.createPost({
        author_id: 'user-ananya',
        author_name: 'Ananya Sharma',
        author_college: 'BMS College of Engineering',
        title: 'Quantum Simulator in Rust',
        tagline: 'State vector simulation on WASM',
        description: 'Simulating 24-qubit entangled states directly in browser canvas.',
        tags: ['Rust', 'Quantum', 'WASM'],
        seeking_teammates: true,
        desired_skills: ['Rust', 'WebGL'],
      });

      expect(created.id).toBeDefined();
      expect(created.title).toBe('Quantum Simulator in Rust');
      expect(created.upvotes).toEqual([]);

      const all = await store.getPosts();
      expect(all.some((p) => p.id === created.id)).toBe(true);
    });

    it('toggles upvotes on a project post', async () => {
      const posts = await store.getPosts();
      const targetPost = posts[0];
      const initialCount = targetPost.upvotes.length;

      // Add upvote
      const upvoted = await store.toggleUpvote(targetPost.id, 'test-student-id');
      expect(upvoted.upvotes).toContain('test-student-id');
      expect(upvoted.upvotes.length).toBe(initialCount + 1);

      // Remove upvote (toggle off)
      const downvoted = await store.toggleUpvote(targetPost.id, 'test-student-id');
      expect(downvoted.upvotes).not.toContain('test-student-id');
      expect(downvoted.upvotes.length).toBe(initialCount);
    });
  });

  describe('Team Collaborative Workspace', () => {
    it('retrieves milestones for a team', async () => {
      const milestones = await store.getMilestones('team-agro-ai');
      expect(milestones.length).toBeGreaterThanOrEqual(2);
      expect(milestones[0]).toHaveProperty('completed');
    });

    it('adds and toggles milestones', async () => {
      const added = await store.addMilestone({
        team_id: 'team-agro-ai',
        title: 'Benchmark latency on Jetson Orin',
        due_date: '2026-12-15',
        assigned_to: 'Rohan Verma',
      });

      expect(added.id).toBeDefined();
      expect(added.completed).toBe(false);

      const toggled = await store.toggleMilestone(added.id);
      expect(toggled.completed).toBe(true);
      expect(toggled.completed_at).toBeDefined();

      await store.deleteMilestone(added.id);
      const afterDelete = await store.getMilestones('team-agro-ai');
      expect(afterDelete.some((m) => m.id === added.id)).toBe(false);
    });

    it('creates and retrieves team sprint updates', async () => {
      const update = await store.createTeamUpdate({
        team_id: 'team-agro-ai',
        author_id: 'user-ananya',
        author_name: 'Ananya Sharma',
        content: 'Camera calibration tests passed on mobile devices!',
      });

      expect(update.id).toBeDefined();
      expect(update.created_at).toBeDefined();

      const allUpdates = await store.getTeamUpdates('team-agro-ai');
      expect(allUpdates.some((u) => u.id === update.id)).toBe(true);
    });
  });

  describe('Events Hub', () => {
    it('fetches campus events and creates new events with creator metadata', async () => {
      const events = await store.getEvents();
      expect(events.length).toBeGreaterThan(0);

      const created = await store.createEvent({
        title: 'Inter-College AI Hackathon 2026',
        description: '48-hour buildathon focusing on agentic workflows and local inference.',
        organizer: 'Bangalore AI Society',
        category: 'hackathon',
        format: 'offline',
        location: 'IIIT Bangalore Campus',
        start_date: '2026-12-20T09:00:00Z',
        end_date: '2026-12-22T18:00:00Z',
        registration_deadline: '2026-12-15T23:59:59Z',
        eligibility: 'Open to all engineering students',
        registration_url: 'https://unstop.com/hackathons/ai-bangalore-2026',
        tags: ['AI', 'Python', 'FastAPI'],
        is_demo_sample: false,
        created_by_id: 'user-ananya',
        created_by_role: 'leader',
      });

      expect(created.id).toBeDefined();
      expect(created.created_by_role).toBe('leader');

      const all = await store.getEvents();
      expect(all[0].id).toBe(created.id);
    });
  });

  describe('Requests and Teams', () => {
    it('prevents duplicate pending requests and supports accept flow', async () => {
      const teamId = 'team-clean-grid';
      const senderId = 'user-ananya';
      const recipientId = 'user-priyanshu';

      const req = await store.createRequest({
        type: 'join_request',
        team_id: teamId,
        sender_id: senderId,
        recipient_id: recipientId,
        role: 'Frontend Lead',
      });

      expect(req.status).toBe('pending');

      // Duplicate request should throw
      await expect(
        store.createRequest({
          type: 'join_request',
          team_id: teamId,
          sender_id: senderId,
          recipient_id: recipientId,
        })
      ).rejects.toThrow();

      // Accepting request adds user as team member
      const accepted = await store.updateRequestStatus(req.id, 'accepted');
      expect(accepted.status).toBe('accepted');

      const members = await store.getTeamMembers(teamId);
      expect(members.some((m) => m.user_id === senderId)).toBe(true);
    });
  });
});
