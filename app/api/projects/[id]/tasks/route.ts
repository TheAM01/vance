import { connectToDatabase } from '@/lib/mongodb'
import { ObjectId } from 'mongodb'
import { NextRequest, NextResponse } from 'next/server'
import { randomUUID } from 'crypto'

function idQuery(id: string) {
    return ObjectId.isValid(id) ? { _id: new ObjectId(id) } : { _id: id as any }
}

// Add a task to a project.
export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { db } = await connectToDatabase()
        const { id } = await params
        const body = await request.json()

        if (!body.title) {
            return NextResponse.json({ error: 'Task title is required' }, { status: 400 })
        }

        const task = {
            _id: randomUUID(),
            title: body.title,
            description: body.description || '',
            status: body.status || 'todo',
            priority: body.priority || 'medium',
            estimatedHours: typeof body.estimatedHours === 'number' ? body.estimatedHours : Number(body.estimatedHours) || 1,
            actualHours: typeof body.actualHours === 'number' ? body.actualHours : 0,
            deadline: body.deadline || '',
            scheduledDate: body.scheduledDate || '',
            completed: false,
            completedAt: null,
            order: typeof body.order === 'number' ? body.order : Date.now(),
            createdAt: new Date().toISOString(),
        }

        const result = await db.collection('projects').updateOne(
            idQuery(id),
            { $push: { tasks: task } as any, $set: { updatedAt: new Date().toISOString() } }
        )

        if (result.matchedCount === 0) {
            return NextResponse.json({ error: 'Project not found' }, { status: 404 })
        }
        return NextResponse.json(task)
    } catch (error) {
        console.error('POST /api/projects/[id]/tasks error:', error)
        return NextResponse.json({ error: 'Failed to add task' }, { status: 500 })
    }
}
