import { response } from "express";
import swaggerJSDoc from "swagger-jsdoc";

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Viblooop APIs",
      version: "1.0.0",
      description: "API documentation for Viblooop",
    },
    components: {
      examples: {
        GetAllEventsResponse: {
          value: {
            statusCode: 200,
            success: true,
            message: "Events fetched successfully",
            data: [
              {
                _id: "68890099ed9f2a6279d47392",
                title: "Everest Base Camp Trek",
                description:
                  "A once-in-a-lifetime trekking adventure to Everest Base Camp.",
                image:
                  "https://images.unsplash.com/photo-1500048993957-9269167dafa0?q=80&w=1170",
                dateTime: "2025-09-10T08:00:00.000Z",
                timezone: "Asia/Kathmandu",
                location: "Lukla",
                attendeeLimit: 15,
                currentAttendees: 0,
                cost: "Paid",
                tags: [],
                gallery: [],
                organizer: "68890057a63ecb4cb60cc585",
                category: "68890099ed9f2a6279d4738b",
                createdAt: "2025-07-29T17:10:49.672Z",
                updatedAt: "2025-07-29T17:10:49.672Z",
              },
            ],
          },
        },
        GenericError: {
          value: {
            statusCode: 500,
            success: false,
            message: "Something went wrong",
            data: null,
            errors: {
              message: "Unexpected error",
            },
          },
        },
      },
    },
    servers: [
      {
        url: "http://localhost:3000",
        description: "Local server",
      },
    ],
  },
  apis: ["./routes/**/*.js"],
};

const swaggerSpec = swaggerJSDoc(options);

export default swaggerSpec;
