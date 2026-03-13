# POST /api/messages/upload-image

## Overview

This endpoint handles single or multiple image uploads for messages. It accepts multipart/form-data requests, validates the images, processes them (resizing if necessary), and stores them in the public uploads directory. Supports both main image upload and gallery uploads (up to 3 images).

## Requirements

- **1.2**: Store uploaded images and return accessible URLs
- **5.5**: Support multipart/form-data uploads
- **8.1**: Validate image file types (JPEG, PNG, WebP)
- **8.4**: Return descriptive error messages on upload failures
- **8.5**: Generate and return public URLs for uploaded images
- **4.1**: Support gallery uploads (up to 3 images)
- **4.3**: Validate image formats for gallery uploads
- **4.4**: Validate image size limits (5MB for gallery images)

## Request

### Method
`POST`

### Content-Type
`multipart/form-data`

### Body Parameters

#### Single Image Upload (Backward Compatible)

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| image | File | Yes | Image file (JPEG, PNG, or WebP) |

#### Multiple Image Upload (Gallery)

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| images | File[] | Yes | Array of image files (JPEG, PNG, or WebP), max 3 |

### Example Requests

#### Single Image Upload

```javascript
const formData = new FormData();
formData.append('image', fileInput.files[0]);

const response = await fetch('/api/messages/upload-image', {
  method: 'POST',
  body: formData,
});
```

#### Multiple Image Upload (Gallery)

```javascript
const formData = new FormData();
// Append multiple files with the same field name 'images'
for (const file of galleryFiles) {
  formData.append('images', file);
}

const response = await fetch('/api/messages/upload-image', {
  method: 'POST',
  body: formData,
});
```

## Response

### Success Response - Single Image (200 OK)

```json
{
  "url": "/uploads/images/0660c61b-ce1f-47b6-a790-42e527124537.png",
  "message": "Image uploaded successfully"
}
```

### Success Response - Multiple Images (200 OK)

```json
{
  "urls": [
    "/uploads/images/0660c61b-ce1f-47b6-a790-42e527124537.png",
    "/uploads/images/2c2980ab-84db-4a50-b18d-9c88c31eb663.png",
    "/uploads/images/fcd6a6f6-9a28-4a91-a69e-a76daa67538d.png"
  ],
  "message": "3 images uploaded successfully"
}
```

### Error Responses

#### No File Provided (400 Bad Request)

```json
{
  "error": {
    "code": "NO_FILE",
    "message": "No image file provided in the request"
  }
}
```

#### Too Many Files (400 Bad Request)

```json
{
  "error": {
    "code": "TOO_MANY_FILES",
    "message": "Maximum 3 gallery images allowed"
  }
}
```

#### Invalid File Format (400 Bad Request)

```json
{
  "error": {
    "code": "INVALID_FILE",
    "message": "Invalid file format in the request"
  }
}
```

#### Invalid Image Type (400 Bad Request)

```json
{
  "error": {
    "code": "INVALID_IMAGE_TYPE",
    "message": "Invalid image type. Allowed types: JPEG, PNG, WebP"
  }
}
```

#### File Too Large (400 Bad Request)

```json
{
  "error": {
    "code": "FILE_TOO_LARGE",
    "message": "Image size exceeds maximum allowed size of 10MB"
  }
}
```

#### Upload Failed (500 Internal Server Error)

```json
{
  "error": {
    "code": "UPLOAD_FAILED",
    "message": "Failed to upload image: [specific error message]"
  }
}
```

## Validation Rules

### Single Image Upload
1. **File Type**: Only JPEG, PNG, and WebP images are accepted
2. **File Size**: Maximum file size is 10MB
3. **Image Processing**: Images larger than 1920x1920 pixels are automatically resized while maintaining aspect ratio

### Multiple Image Upload (Gallery)
1. **File Type**: Only JPEG, PNG, and WebP images are accepted
2. **File Size**: Maximum file size is 5MB per image (stricter limit for gallery)
3. **Image Count**: Maximum 3 images per request
4. **Image Processing**: Images larger than 1920x1920 pixels are automatically resized while maintaining aspect ratio

## CORS Headers

The endpoint includes the following CORS headers:
- `Access-Control-Allow-Origin: *`
- `Access-Control-Allow-Methods: POST, OPTIONS`
- `Access-Control-Allow-Headers: Content-Type`

## Implementation Details

1. **Multipart Parsing**: Uses Next.js built-in `formData()` method to parse multipart/form-data
2. **File Validation**: Validates file type and size before processing
3. **Image Processing**: Uses the `ImageService` to resize and store images
4. **Storage**: Images are stored in `public/uploads/images/` with UUID-based filenames
5. **URL Generation**: Returns relative URLs that can be accessed publicly

## Testing

Run the integration tests:

```bash
npx tsx src/app/api/messages/upload-image/__tests__/integration-test.ts
```

The test suite covers:
- Successful image upload
- Missing file error handling
- Invalid file type validation
- CORS headers verification
- Descriptive error messages for file size limits

## Related Services

- **ImageService**: Handles image validation, resizing, and storage
- **MessageService**: Uses uploaded image URLs when creating messages

## Next Steps

After uploading images, use the returned URL(s) in the message creation endpoint:

### Single Image Example

```javascript
// 1. Upload main image
const formData = new FormData();
formData.append('image', mainImageFile);

const uploadResponse = await fetch('/api/messages/upload-image', {
  method: 'POST',
  body: formData,
});
const { url: imageUrl } = await uploadResponse.json();

// 2. Create message with image URL
const messageResponse = await fetch('/api/messages/create', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    recipientName: 'Ana',
    senderName: 'Pedro',
    messageText: 'Happy Birthday!',
    imageUrl: imageUrl, // Use the uploaded image URL
  }),
});
```

### Gallery Images Example

```javascript
// 1. Upload gallery images
const galleryFormData = new FormData();
galleryFiles.forEach(file => {
  galleryFormData.append('images', file);
});

const galleryResponse = await fetch('/api/messages/upload-image', {
  method: 'POST',
  body: galleryFormData,
});
const { urls: galleryUrls } = await galleryResponse.json();

// 2. Create message with gallery URLs
const messageResponse = await fetch('/api/messages/create', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    recipientName: 'Ana',
    senderName: 'Pedro',
    messageText: 'Happy Birthday!',
    imageUrl: mainImageUrl,
    galleryImages: galleryUrls, // Use the uploaded gallery URLs
    title: 'Feliz Aniversário!',
    specialDate: new Date('2024-12-25'),
    closingMessage: 'Com muito carinho',
    signature: 'Pedro',
  }),
});
```
