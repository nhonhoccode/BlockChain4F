"""
Integration tests for request workflow.
"""
import pytest
from django.urls import reverse
from rest_framework import status


@pytest.mark.django_db
@pytest.mark.integration
class TestRequestWorkflow:
    """Tests for the complete request workflow process."""

    def test_create_and_process_request(self, chairman_client, official_client, citizen_client, mock_blockchain_connection):
        """Test the full workflow from request creation to completion."""
        # 1. Citizen creates a request
        create_url = reverse('blockchain:request_create')
        request_data = {
            'title': 'Test Request',
            'description': 'This is a test request',
            'category': 'BUSINESS_LICENSE',
            'attachments': []
        }
        response = citizen_client.post(create_url, request_data)
        assert response.status_code == status.HTTP_302_FOUND
        
        # Get the ID of the created request from the redirect URL
        request_id = response.url.split('/')[-2]
        
        # 2. Chairman assigns the request to an official
        assign_url = reverse('blockchain:request_assign', args=[request_id])
        assign_data = {
            'official': 'official'  # Username of the official
        }
        response = chairman_client.post(assign_url, assign_data)
        assert response.status_code == status.HTTP_302_FOUND
        
        # 3. Official processes the request
        process_url = reverse('blockchain:request_process', args=[request_id])
        process_data = {
            'status': 'APPROVED',
            'comments': 'Request approved after review'
        }
        response = official_client.post(process_url, process_data)
        assert response.status_code == status.HTTP_302_FOUND
        
        # 4. Verify the request status is updated
        detail_url = reverse('blockchain:request_detail', args=[request_id])
        response = citizen_client.get(detail_url)
        assert response.status_code == status.HTTP_200_OK
        assert 'APPROVED' in str(response.content)
        
        # 5. Verify blockchain transaction was created
        assert mock_blockchain_connection.submit_request.called 