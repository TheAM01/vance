import { connectToDatabase } from '@/lib/mongodb'
import { ObjectId } from 'mongodb'
import { NextRequest, NextResponse } from 'next/server'

// _id may be a real ObjectId or a custom string — query both ways.
function idQuery(id: string) {
    return ObjectId.isValid(id) ? { _id: new ObjectId(id) } : { _id: id as any }
}

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { db } = await connectToDatabase()
        const { id } = await params
        const contact = await db.collection('contacts').findOne(idQuery(id))
        if (!contact) {
            return NextResponse.json({ error: 'Contact not found' }, { status: 404 })
        }
        return NextResponse.json(contact)
    } catch (error) {
        console.error('GET /api/contacts/[id] error:', error)
        return NextResponse.json({ error: 'Failed to fetch contact' }, { status: 500 })
    }
}

export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { db } = await connectToDatabase()
        const { id } = await params
        const body = await request.json()

        const fields = [
            'name', 'email', 'phone', 'company', 'role', 'location',
            'linkedin', 'website', 'source', 'relationship', 'description',
            'color', 'projectIds',
        ]

        const updateData: Record<string, unknown> = { updatedAt: new Date().toISOString() }
        for (const f of fields) {
            if (body[f] !== undefined) updateData[f] = body[f]
        }

        const result = await db.collection('contacts').updateOne(
            idQuery(id),
            { $set: updateData }
        )

        if (result.matchedCount === 0) {
            return NextResponse.json({ error: 'Contact not found' }, { status: 404 })
        }
        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('PATCH /api/contacts/[id] error:', error)
        return NextResponse.json({ error: 'Failed to update contact' }, { status: 500 })
    }
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { db } = await connectToDatabase()
        const { id } = await params
        const result = await db.collection('contacts').deleteOne(idQuery(id))
        if (result.deletedCount === 0) {
            return NextResponse.json({ error: 'Contact not found' }, { status: 404 })
        }
        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('DELETE /api/contacts/[id] error:', error)
        return NextResponse.json({ error: 'Failed to delete contact' }, { status: 500 })
    }
}
