import { useQuery, useMutation, useQueryClient, UseQueryOptions, UseMutationOptions } from '@tanstack/react-query';
import {
  MessagingServiceClient,
  Conversation,
  ConversationList,
  Message,
  MessageList,
  CreateConversationRequest,
  UpdateConversationRequest,
  GetConversationsRequest,
  SendMessageRequest
} from '../api/messagingServiceClient';

// Create a singleton instance of the client
const messagingClient = new MessagingServiceClient();

// Query keys for caching
export const queryKeys = {
  conversations: ['conversations'] as const,
  conversation: (id: string) => ['conversation', id] as const,
  messages: (conversationId: string) => ['messages', conversationId] as const,
};

/**
 * Custom hook for using the Messaging Service with React Query
 */
export const useMessagingService = () => {
  const queryClient = useQueryClient();

  // Get conversations list
  const useConversations = (
    params?: GetConversationsRequest,
    options?: UseQueryOptions<ConversationList>
  ) => {
    return useQuery({
      queryKey: [...queryKeys.conversations, params],
      queryFn: () => messagingClient.getConversations(params),
      ...options,
    });
  };

  // Get a single conversation
  const useConversation = (
    conversationId: string,
    options?: UseQueryOptions<Conversation>
  ) => {
    return useQuery({
      queryKey: queryKeys.conversation(conversationId),
      queryFn: () => messagingClient.getConversation(conversationId),
      ...options,
    });
  };

  // Get messages for a conversation
  const useMessages = (
    conversationId: string,
    options?: UseQueryOptions<MessageList>
  ) => {
    return useQuery({
      queryKey: queryKeys.messages(conversationId),
      queryFn: () => messagingClient.getMessages(conversationId),
      ...options,
    });
  };

  // Create a new conversation
  const useCreateConversation = (
    options?: UseMutationOptions<Conversation, Error, CreateConversationRequest>
  ) => {
    return useMutation({
      mutationFn: (data?: CreateConversationRequest) => messagingClient.createConversation(data),
      onSuccess: () => {
        // Invalidate conversations list to trigger a refetch
        queryClient.invalidateQueries({ queryKey: queryKeys.conversations });
      },
      ...options,
    });
  };

  // Update a conversation
  const useUpdateConversation = (
    options?: UseMutationOptions<
      Conversation,
      Error,
      { conversationId: string; data: UpdateConversationRequest }
    >
  ) => {
    return useMutation({
      mutationFn: ({ conversationId, data }) =>
        messagingClient.updateConversation(conversationId, data),
      onSuccess: (data, variables) => {
        // Update the conversation in the cache
        queryClient.invalidateQueries({
          queryKey: queryKeys.conversation(variables.conversationId)
        });
        // Also update the conversations list
        queryClient.invalidateQueries({ queryKey: queryKeys.conversations });
      },
      ...options,
    });
  };

  // Send a message
  const useSendMessage = (
    options?: UseMutationOptions<
      Message,
      Error,
      { conversationId: string; data: SendMessageRequest }
    >
  ) => {
    return useMutation({
      mutationFn: ({ conversationId, data }) =>
        messagingClient.sendMessage(conversationId, data),
      onSuccess: (data, variables) => {
        // Update messages in the cache
        queryClient.invalidateQueries({
          queryKey: queryKeys.messages(variables.conversationId)
        });
        // Also update the conversation to reflect new message count
        queryClient.invalidateQueries({
          queryKey: queryKeys.conversation(variables.conversationId)
        });
        // Update conversations list to show latest message
        queryClient.invalidateQueries({ queryKey: queryKeys.conversations });
      },
      ...options,
    });
  };

  return {
    useConversations,
    useConversation,
    useMessages,
    useCreateConversation,
    useUpdateConversation,
    useSendMessage,
  };
}; 