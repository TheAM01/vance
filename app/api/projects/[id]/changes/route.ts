import { connectToDatabase } from '@/lib/mongodb'
import { ObjectId } from 'mongodb'
import { NextRequest, NextResponse } from 'next/server'
import { randomUUID } from 'crypto'

function idQuery(id: string) {
    return ObjectId.isValid(id) ? { _id: new ObjectId(id) } : { _id: id as any }
}

// Add a change / revision request to a project.
export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { db } = await connectToDatabase()
        const { id } = await params
        const body = await request.json()

        if (!body.title) {
            return NextResponse.json({ error: 'Change title is required' }, { status: 400 })
        }

        const change = {
            _id: randomUUID(),
            title: body.title,
            description: body.description || '',
            status: body.status || 'pending',
            amount: typeof body.amount === 'number' ? body.amount : Number(body.amount) || 0,
            requestedAt: body.requestedAt || new Date().toISOString().split('T')[0],
            completed: false,
            completedAt: null,
            order: typeof body.order === 'number' ? body.order : Date.now(),
        }

        const result = await db.collection('projects').updateOne(
            idQuery(id),
            { $push: { changes: change } as any, $set: { updatedAt: new Date().toISOString() } }
        )

        if (result.matchedCount === 0) {
            return NextResponse.json({ error: 'Project not found' }, { status: 404 })
        }
        return NextResponse.json(change)
    } catch (error) {
        console.error('POST /api/projects/[id]/changes error:', error)
        return NextResponse.json({ error: 'Failed to add change' }, { status: 500 })
    }
}
