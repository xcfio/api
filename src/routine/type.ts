import { Type, Static } from "@sinclair/typebox"
import { ErrorResponse } from "../type"

export const ClassSchedule = Type.Object({
    time: Type.String(),
    subject: Type.String(),
    teacher: Type.String(),
    classroom: Type.String()
})

export const DailySchedule = Type.Object({
    "1": ClassSchedule,
    "2": ClassSchedule,
    "3": ClassSchedule,
    "4": ClassSchedule,
    "5": ClassSchedule,
    "6": ClassSchedule,
    "7": ClassSchedule
})

export const CodeType = Type.TemplateLiteral([
    Type.Union([
        Type.Literal("67"),
        Type.Literal("68"),
        Type.Literal("69"),
        Type.Literal("72"),
        Type.Literal("85"),
        Type.Literal("92")
    ]),
    Type.Literal("-"),
    Type.Union([
        Type.Literal("1"),
        Type.Literal("2"),
        Type.Literal("3"),
        Type.Literal("4"),
        Type.Literal("5"),
        Type.Literal("6"),
        Type.Literal("7")
    ]),
    Type.Union([Type.Literal("A"), Type.Literal("B")]),
    Type.Union([Type.Literal("1"), Type.Literal("2")])
])

export const PostBody = Type.Object({
    year: Type.String(),
    department: Type.String(),
    semester: Type.String(),
    shift: Type.String(),
    group: Type.String()
})

export const RoutineData = Type.Object({
    code: CodeType,
    load: Type.String(),
    class: Type.Object({
        Sunday: DailySchedule,
        Monday: DailySchedule,
        Tuesday: DailySchedule,
        Wednesday: DailySchedule,
        Thursday: DailySchedule
    }),
    teacher: Type.Array(
        Type.Object({
            name: Type.String(),
            designation: Type.String(),
            mobile: Type.String(),
            subject: Type.String()
        })
    )
})

export const PutQuery = Type.Object({
    key: Type.String(),
    year: Type.Optional(Type.String())
})

export const PutResponse = Type.Optional(
    Type.Object({
        id: Type.String(),
        message: Type.String()
    })
)

export const PostSchema = {
    body: PostBody,
    response: {
        "4xx": ErrorResponse,
        "5xx": ErrorResponse,
        200: RoutineData
    }
}

export const PutSchema = {
    querystring: PutQuery,
    body: RoutineData,
    response: {
        "4xx": ErrorResponse,
        "5xx": ErrorResponse,
        201: PutResponse
    }
}
