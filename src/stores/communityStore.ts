import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { joinCommunity, leaveCommunity } from '../services/community';

interface CommunityState {
  memberships: Record<string, boolean>;
  pendingJoins: string[];
  pendingLeaves: string[];
  joinCommunityAction: (communityId: string) => Promise<void>;
  leaveCommunityAction: (communityId: string) => Promise<void>;
  syncPendingActions: () => Promise<void>;
}

export const useCommunityStore = create<CommunityState>()(
  persist(
    (set, get) => ({
      memberships: {},
      pendingJoins: [],
      pendingLeaves: [],

      joinCommunityAction: async (communityId) => {
        try {
          // Optimistically update UI
          set((state) => ({
            memberships: { ...state.memberships, [communityId]: true }
          }));

          await joinCommunity(communityId);
        } catch (error) {
          // Revert on failure
          set((state) => ({
            memberships: { ...state.memberships, [communityId]: false },
            pendingJoins: [...state.pendingJoins, communityId]
          }));
          throw error;
        }
      },

      leaveCommunityAction: async (communityId) => {
        try {
          // Optimistically update UI
          set((state) => ({
            memberships: { ...state.memberships, [communityId]: false }
          }));

          await leaveCommunity(communityId);
        } catch (error) {
          // Revert on failure
          set((state) => ({
            memberships: { ...state.memberships, [communityId]: true },
            pendingLeaves: [...state.pendingLeaves, communityId]
          }));
          throw error;
        }
      },

      syncPendingActions: async () => {
        const state = get();
        const { pendingJoins, pendingLeaves } = state;

        // Process pending joins
        for (const communityId of pendingJoins) {
          try {
            await joinCommunity(communityId);
            set((state) => ({
              pendingJoins: state.pendingJoins.filter(id => id !== communityId)
            }));
          } catch (error) {
            console.error(`Failed to sync join for community ${communityId}:`, error);
          }
        }

        // Process pending leaves
        for (const communityId of pendingLeaves) {
          try {
            await leaveCommunity(communityId);
            set((state) => ({
              pendingLeaves: state.pendingLeaves.filter(id => id !== communityId)
            }));
          } catch (error) {
            console.error(`Failed to sync leave for community ${communityId}:`, error);
          }
        }
      }
    }),
    {
      name: 'community-store',
      partialize: (state) => ({
        memberships: state.memberships,
        pendingJoins: state.pendingJoins,
        pendingLeaves: state.pendingLeaves
      })
    }
  )
);