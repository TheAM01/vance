import { connectToDatabase } from '@/lib/mongodb'
import { ObjectId } from 'mongodb'
import { NextRequest, NextResponse } from 'next/server'

function idQuery(id: string) {
    return ObjectId.isValid(id) ? { _id: new ObjectId(id) } : { _id: id as any }
}

export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ id: string; changeId: string }> }
) {
    try {
        const { db } = await connectToDatabase()
        const { id, changeId } = await params
        const body = await request.json()

        const set: Record<string, unknown> = { updatedAt: new Date().toISOString() }
        const map: Record<string, string> = {
            title: 'changes.$[c].title',
            description: 'changes.$[c].description',
            status: 'changes.$[c].status',
            amount: 'changes.$[c].amount',
            requestedAt: 'changes.$[c].requestedAt',
            order: 'changes.$[c].order',
        }
        for (const k of Object.keys(map)) {
            if (body[k] !== undefined) set[map[k]] = body[k]
        }

        if (body.completed !== undefined) {
            set['changes.$[c].completed'] = body.completed
            set['changes.$[c].completedAt'] = body.completed ? new Date().toISOString() : null
            set['changes.$[c].status'] = body.completed ? 'done' : (body.status || 'pending')
        }

        const result = await db.collection('projects').updateOne(
            idQuery(id),
            { $set: set },
            { arrayFilters: [{ 'c._id': changeId }] }
        )

        if (result.matchedCount === 0) {
            return NextResponse.json({ error: 'Project not found' }, { status: 404 })
        }
        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('PATCH change error:', error)
        return NextResponse.json({ error: 'Failed to update change' }, { status: 500 })
    }
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string; changeId: string }> }
) {
    try {
        const { db } = await connectToDatabase()
        const { id, changeId } = await params

        const result = await db.collection('projects').updateOne(
            idQuery(id),
            { $pull: { changes: { _id: changeId } } as any, $set: { updatedAt: new Date().toISOString() } }
        )

        if (result.matchedCount === 0) {
            return NextResponse.json({ error: 'Project not found' }, { status: 404 })
        }
        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('DELETE change error:', error)
        return NextResponse.json({ error: 'Failed to delete change' }, { status: 500 })
    }
}
