import { connectToDatabase } from '@/lib/mongodb'
import { ObjectId } from 'mongodb'
import { NextRequest, NextResponse } from 'next/server'

function idQuery(id: string) {
    return ObjectId.isValid(id) ? { _id: new ObjectId(id) } : { _id: id as any }
}

export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ id: string; taskId: string }> }
) {
    try {
        const { db } = await connectToDatabase()
        const { id, taskId } = await params
        const body = await request.json()

        const set: Record<string, unknown> = { updatedAt: new Date().toISOString() }
        const map: Record<string, string> = {
            title: 'tasks.$[t].title',
            description: 'tasks.$[t].description',
            status: 'tasks.$[t].status',
            priority: 'tasks.$[t].priority',
            estimatedHours: 'tasks.$[t].estimatedHours',
            actualHours: 'tasks.$[t].actualHours',
            deadline: 'tasks.$[t].deadline',
            scheduledDate: 'tasks.$[t].scheduledDate',
            order: 'tasks.$[t].order',
        }
        for (const k of Object.keys(map)) {
            if (body[k] !== undefined) set[map[k]] = body[k]
        }

        if (body.completed !== undefined) {
            set['tasks.$[t].completed'] = body.completed
            set['tasks.$[t].completedAt'] = body.completed ? new Date().toISOString() : null
            set['tasks.$[t].status'] = body.completed ? 'done' : (body.status || 'todo')
        }

        const result = await db.collection('projects').updateOne(
            idQuery(id),
            { $set: set },
            { arrayFilters: [{ 't._id': taskId }] }
        )

        if (result.matchedCount === 0) {
            return NextResponse.json({ error: 'Project not found' }, { status: 404 })
        }
        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('PATCH task error:', error)
        return NextResponse.json({ error: 'Failed to update task' }, { status: 500 })
    }
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string; taskId: string }> }
) {
    try {
        const { db } = await connectToDatabase()
        const { id, taskId } = await params

        const result = await db.collection('projects').updateOne(
            idQuery(id),
            { $pull: { tasks: { _id: taskId } } as any, $set: { updatedAt: new Date().toISOString() } }
        )

        if (result.matchedCount === 0) {
            return NextResponse.json({ error: 'Project not found' }, { status: 404 })
        }
        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('DELETE task error:', error)
        return NextResponse.json({ error: 'Failed to delete task' }, { status: 500 })
    }
}
